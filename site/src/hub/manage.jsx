// Record management for school master data: search, filters, create, edit, archive / restore, field
// validation, loading, empty and error states, and audit information (who created and last changed a
// record, plus its recent history). Records are never deleted from the hub; archiving keeps history.
// Each screen describes its fields and columns; writes are stamped and checked again by firestore.rules.
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, limit, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase-firestore";
import { useAuth } from "../auth/AuthProvider";
import { can } from "../auth/permissions";
import { list, staffNames, useLoad } from "./data";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, StatusBadge, asDate } from "./ui";

const when = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const stampDate = (value) => { const date = asDate(value); return date && !Number.isNaN(date.getTime()) ? when.format(date) : null; };
export const personName = (people, id) => (!id ? "—" : id === "seed-script" ? "data import" : people?.[id] || "school staff");
export const slug = (value) => String(value || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 40);
export const isActive = (row) => (row.status ?? "active") === "active";

// Firestore error → a sentence the person can act on.
export function saveErrorMessage(error) {
  if (error?.code === "permission-denied") return "The server refused this change: your role can't make it, or a rule protecting this record would be broken (for example assigning yourself, or changing a record's history).";
  if (error?.code === "unavailable") return "You appear to be offline. Nothing was saved; try again when you're connected.";
  return error?.message || "That didn't save. Please try again.";
}

const blank = (value) => value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

function normalise(field, value) {
  if (field.type === "number") return blank(value) ? null : Number(value);
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "checkboxes") return Array.isArray(value) ? value : [];
  if (typeof value === "string") return value.trim() === "" ? null : value.trim();
  return value ?? null;
}

function fieldError(field, value) {
  if (field.required && blank(value)) return `${field.label} is required.`;
  if (blank(value)) return null;
  if (field.type === "number") {
    const number = Number(value);
    if (!Number.isFinite(number) || (field.integer !== false && !Number.isInteger(number))) return `${field.label} must be a whole number.`;
    if (field.min != null && number < field.min) return `${field.label} must be at least ${field.min}.`;
    if (field.max != null && number > field.max) return `${field.label} must be at most ${field.max}.`;
  }
  if (field.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value).trim())) return "Enter a valid email address.";
  if (field.maxLength && String(value).length > field.maxLength) return `${field.label} must be ${field.maxLength} characters or fewer.`;
  if (field.pattern && !field.pattern.test(String(value).trim())) return field.patternMessage || `${field.label} isn't in the expected format.`;
  return null;
}

function Field({ field, value, error, disabled, onChange, lookups, draft }) {
  const id = `fld-${field.key}`;
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = { id, name: field.key, disabled, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };
  const options = typeof field.options === "function" ? field.options(lookups, draft) : field.options || [];
  let control;
  if (field.type === "select") control = <select {...common} value={value ?? ""} required={field.required} onChange={(event) => onChange(event.target.value)}><option value="">{field.placeholder || "Choose…"}</option>{options.map(([optionValue, label, extra]) => <option key={optionValue} value={optionValue} disabled={extra?.disabled}>{label}</option>)}</select>;
  else if (field.type === "textarea") control = <textarea {...common} rows={field.rows || 3} maxLength={field.maxLength} value={value ?? ""} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />;
  else if (field.type === "checkbox") return <div className={`hub-field ${field.wide ? "hub-field-wide" : ""}`}><label className="hub-check"><input type="checkbox" {...common} checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />{field.label}</label>{field.help && <small id={`${id}-help`} className="hub-field-help">{field.help}</small>}</div>;
  else if (field.type === "checkboxes") return <fieldset className={`hub-field hub-field-wide hub-checkset`} aria-describedby={describedBy}><legend>{field.label}</legend><div>{options.length ? options.map(([optionValue, label]) => <label key={optionValue} className="hub-check"><input type="checkbox" disabled={disabled} checked={(value || []).includes(optionValue)} onChange={(event) => onChange(event.target.checked ? [...(value || []), optionValue] : (value || []).filter((item) => item !== optionValue))} />{label}</label>) : <small>{field.emptyOptions || "Nothing to choose yet."}</small>}</div>{field.help && <small id={`${id}-help`} className="hub-field-help">{field.help}</small>}</fieldset>;
  else control = <input {...common} type={field.type || "text"} required={field.required} value={value ?? ""} min={field.min} max={field.max} step={field.type === "number" ? 1 : undefined} maxLength={field.maxLength} placeholder={field.placeholder} autoComplete="off" onChange={(event) => onChange(event.target.value)} />;
  return <div className={`hub-field ${field.wide ? "hub-field-wide" : ""}`}>
    <label htmlFor={id}>{field.label}{field.required && <span className="hub-required" aria-hidden="true"> *</span>}</label>
    {control}
    {field.help && <small id={`${id}-help`} className="hub-field-help">{field.help}</small>}
    {error && <small id={`${id}-error`} className="hub-field-error">{error}</small>}
  </div>;
}

// Recent changes from the server-written audit trail (shown to roles that can read governance).
function RecordHistory({ path, people }) {
  const { data, loading } = useLoad(() => list("auditLogs", where("path", "==", path), limit(20)).catch(() => []), [path]);
  if (loading) return <Loading label="Loading history…" />;
  const rows = (data || []).sort((a, b) => (b.at?.seconds || 0) - (a.at?.seconds || 0)).slice(0, 8);
  if (!rows.length) return <p className="hub-hint">No server-recorded changes yet.</p>;
  return <ul className="hub-history">{rows.map((row) => <li key={row.id}><strong>{row.type.split(".").pop()}</strong> {stampDate(row.at)} · {personName(people, row.actorUid)}{row.fields?.length ? <small> — {row.fields.filter((key) => !["updatedAt", "updatedBy"].includes(key)).join(", ")}</small> : null}</li>)}</ul>;
}

export function AuditLine({ record, people }) {
  if (!record?.createdAt && !record?.updatedAt) return null;
  return <p className="hub-updated">
    {record.createdAt && <>Created {stampDate(record.createdAt)} by {personName(people, record.createdBy)}</>}
    {record.updatedAt && <>{record.createdAt ? " · " : ""}Last updated {stampDate(record.updatedAt)} by {personName(people, record.updatedBy)}</>}
    {record.status === "archived" && record.archivedAt && <> · Archived {stampDate(record.archivedAt)} by {personName(people, record.archivedBy)}</>}
  </p>;
}

export function RecordManager({
  kicker, title, intro, collection: path, noun, nameOf = (row) => row.name,
  load, lookups: loadLookups, fields, columns, searchKeys = ["name"], filters, statusOptions = [["active", "Active"], ["archived", "Archived"]],
  defaults, makeId, validate, prepare, extraWrites, canEdit, canCreate = canEdit, rowActions, archivable = () => true, editable = () => true,
  createLabel, emptyTitle, emptyHint, headerActions, banner, pageSize = 15, exportName, initialSort, initialFilters, toDraft, afterSave, startOpen = false, children,
}) {
  const auth = useAuth();
  const [editing, setEditing] = useState(null); // { isNew, original, draft }
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const editorRef = useRef(null);

  const { data, loading, error, reload } = useLoad(async () => {
    const [rows, lookupData, people] = await Promise.all([load ? load() : list(path), loadLookups ? loadLookups() : {}, staffNames().catch(() => ({}))]);
    return { rows, lookups: lookupData, people };
  }, [path]);
  const rows = data?.rows || [];
  const lookups = data?.lookups || {};
  const showHistory = Boolean(can(auth.roles, "governance", "V"));

  useEffect(() => { if (editing) { editorRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }); editorRef.current?.querySelector("input:not([disabled]), select:not([disabled]), textarea:not([disabled])")?.focus({ preventScroll: true }); } }, [editing?.original?.id, editing?.isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  const opened = useRef(false);
  useEffect(() => { if (startOpen && data && !opened.current && canCreate) { opened.current = true; open(null); } }); // eslint-disable-line react-hooks/exhaustive-deps
  const open = (original) => { setNotice(null); setErrors({}); setConfirm(null); setEditing({ isNew: !original, original, draft: original ? { ...original, ...(toDraft ? toDraft(original, lookups) : {}) } : { status: "active", ...(defaults ? defaults(lookups) : {}) } }); };
  const close = () => { setEditing(null); setErrors({}); };
  const setValue = (key, value) => setEditing((current) => ({ ...current, draft: { ...current.draft, [key]: value } }));
  const visibleFields = editing ? fields.filter((field) => !field.show || field.show(editing.draft, lookups, editing)) : [];

  async function save(event) {
    event.preventDefault();
    const { isNew, original, draft } = editing;
    const values = Object.fromEntries(visibleFields.filter((field) => !field.readOnly).map((field) => [field.key, normalise(field, draft[field.key])]));
    const found = Object.fromEntries(visibleFields.map((field) => [field.key, fieldError(field, draft[field.key])]).filter(([, message]) => message));
    const id = isNew && makeId ? makeId(values, lookups) : original?.id;
    if (isNew && makeId && rows.some((row) => row.id === id)) found._form = `A ${noun} with these details already exists${rows.find((row) => row.id === id)?.status === "archived" ? " (archived — restore it instead)" : ""}.`;
    // A screen's own checks add to the required-field checks; they never clear them.
    for (const [key, message] of Object.entries(validate ? validate(values, { isNew, original, rows, lookups, uid: auth.user.uid }) || {} : {})) if (message && !found[key]) found[key] = message;
    const clean = Object.fromEntries(Object.entries(found).filter(([, message]) => message));
    setErrors(clean);
    if (Object.keys(clean).length) { editorRef.current?.querySelector("[aria-invalid='true']")?.focus(); return; }
    setBusy(true);
    try {
      const stamp = serverTimestamp();
      const prepared = prepare ? await prepare(values, { isNew, original, lookups, uid: auth.user.uid }) : values;
      const payload = isNew ? { status: "active", ...prepared, createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid } : { ...prepared, updatedAt: stamp, updatedBy: auth.user.uid };
      const batch = writeBatch(db);
      const ref = isNew ? (id ? doc(db, path, id) : doc(collection(db, path))) : doc(db, path, original.id);
      if (isNew) batch.set(ref, payload); else batch.update(ref, payload);
      if (extraWrites) await extraWrites(batch, { ref, payload, values, isNew, original, lookups, uid: auth.user.uid, stamp });
      await batch.commit();
      afterSave?.();
      const label = nameOf({ ...original, ...values, id: ref.id }, lookups);
      setNotice({ tone: "good", text: label ? `${isNew ? "Added" : "Saved"} ${noun} “${label}”.` : `${isNew ? "Added" : "Saved"} the ${noun}.` });
      close(); reload();
    } catch (reason) { setErrors({ _form: saveErrorMessage(reason) }); }
    setBusy(false);
  }

  async function setArchived(row, archived) {
    setBusy(true); setNotice(null);
    try {
      const stamp = serverTimestamp();
      const batch = writeBatch(db);
      batch.update(doc(db, path, row.id), archived ? { status: "archived", archivedAt: stamp, archivedBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid } : { status: "active", archivedAt: null, archivedBy: null, updatedAt: stamp, updatedBy: auth.user.uid });
      await batch.commit();
      setNotice({ tone: "good", text: `${archived ? "Archived" : "Restored"} ${noun}${nameOf(row, lookups) ? ` “${nameOf(row, lookups)}”` : ""}.${archived ? " It stays in the records and can be restored." : ""}` });
      setConfirm(null); reload();
    } catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
    setBusy(false);
  }

  // Column and filter definitions read the lookups, so they are built only once the data has loaded.
  const tableColumns = useMemo(() => !data ? [] : [
    ...(columns ? columns(lookups, data?.people) : []),
    { key: "updatedAt", label: "Last updated", sortValue: (row) => row.updatedAt?.seconds || 0, csv: (row) => stampDate(row.updatedAt) || "", render: (row) => <span className="hub-cell-muted">{stampDate(row.updatedAt) ? `${formatShort(row.updatedAt)} · ${personName(data?.people, row.updatedBy)}` : "—"}</span> },
    ...(canEdit || rowActions ? [{ key: "_actions", label: "Actions", sortable: false, csv: () => "", render: (row) => {
      const blocked = archivable(row, { rows, lookups });
      if (confirm === row.id) return <span className="hub-row-actions hub-confirm" role="group" aria-label={`Confirm archiving ${nameOf(row, lookups)}`}><span>Archive?</span><button type="button" className="hub-button hub-button-small" disabled={busy} onClick={() => setArchived(row, true)}>Archive</button><button type="button" className="hub-button hub-button-small hub-button-quiet" onClick={() => setConfirm(null)}>Cancel</button></span>;
      return <span className="hub-row-actions">
        {canEdit && editable(row) && <button type="button" className="hub-link-button" onClick={() => open(row)} aria-label={`Edit ${nameOf(row, lookups)}`}>Edit</button>}
        {rowActions?.(row, { reload, lookups, rows, setNotice })}
        {canEdit && row.status === "archived" && <button type="button" className="hub-link-button" disabled={busy} onClick={() => setArchived(row, false)}>Restore</button>}
        {canEdit && isActive(row) && blocked === true && <button type="button" className="hub-link-button hub-link-danger" onClick={() => setConfirm(row.id)} aria-label={`Archive ${nameOf(row, lookups)}`}>Archive</button>}
        {canEdit && isActive(row) && typeof blocked === "string" && <span className="hub-cell-muted" title={blocked}>Can't archive yet</span>}
      </span>;
    } }] : []),
  ], [data, columns, lookups, canEdit, rowActions, confirm, busy, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const tableFilters = !data ? [] : [...(filters ? filters(lookups) : []), ...(statusOptions ? [{ key: "status", label: "Status", value: (row) => row.status ?? "active", options: statusOptions }] : [])];

  return <>
    <PageHeader kicker={kicker} title={title} actions={<>{headerActions?.({ reload, lookups, rows, setNotice })}{canCreate && !editing?.isNew && <button type="button" className="hub-button" onClick={() => open(null)}>{createLabel || `Add ${noun}`}</button>}</>}>{intro}</PageHeader>
    {banner?.({ rows, lookups, reload, setNotice })}
    <div aria-live="polite">{notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role={notice.tone === "bad" ? "alert" : "status"}>{notice.text}</p>}</div>
    {editing && <form ref={editorRef} className="hub-form hub-form-wide hub-editor" onSubmit={save} noValidate aria-labelledby="editor-title">
      <div className="hub-editor-head"><h2 id="editor-title">{editing.isNew ? (createLabel || `Add ${noun}`) : `Edit ${noun}: ${nameOf(editing.original, lookups)}`}</h2>{!editing.isNew && <StatusBadge status={editing.original.status ?? "active"} />}</div>
      {!editing.isNew && <AuditLine record={editing.original} people={data?.people} />}
      <div className="hub-form-row">{visibleFields.map((field) => <Field key={field.key} field={field} lookups={lookups} draft={editing.draft} value={editing.draft[field.key]} error={errors[field.key]} disabled={busy || field.readOnly || (!editing.isNew && field.immutable)} onChange={(value) => setValue(field.key, value)} />)}</div>
      {!editing.isNew && fields.some((field) => field.immutable) && <p className="hub-hint">Greyed-out fields can't change once a record exists, so its history stays true. To change them, archive this record and add a new one.</p>}
      {errors._form && <p className="hub-error" role="alert">{errors._form}</p>}
      <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={busy}>{busy ? "Saving…" : editing.isNew ? `Add ${noun}` : "Save changes"}</button><button type="button" className="hub-button hub-button-quiet" onClick={close} disabled={busy}>Cancel</button></div>
      {!editing.isNew && showHistory && <details className="hub-history-wrap"><summary>Change history</summary><RecordHistory path={`${path}/${editing.original.id}`} people={data?.people} /></details>}
    </form>}
    <ErrorNote error={error} />
    {loading ? <Loading /> : error ? null : !rows.length ? <EmptyState title={emptyTitle || `No ${noun} records yet.`}>{emptyHint}{canCreate && !editing && <><br /><button type="button" className="hub-button hub-button-small hub-empty-action" onClick={() => open(null)}>{createLabel || `Add the first ${noun}`}</button></>}</EmptyState>
      : <DataTable rows={rows} columns={tableColumns} searchKeys={searchKeys} filters={tableFilters} initialFilters={{ ...(statusOptions ? { status: statusOptions[0][0] } : {}), ...(initialFilters && data ? initialFilters(lookups) : {}) }} pageSize={pageSize} exportName={exportName} initialSort={initialSort} empty={`No ${noun} records match these filters.`} />}
    {children?.({ rows, lookups, reload })}
  </>;
}

const formatShort = (value) => { const date = asDate(value); return date ? new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short" }).format(date) : "—"; };
