// Website content (CMS) and the website inbox — the hub replacement for the retired /admin prototype.
// Workflow (PUB-002): Content Editors draft and send for review; Leadership publishes, and only
// Leadership changes what is already live. School Administrators manage public events and read the rest.
// Page copy (homepage, About, FAQs) is edited as a staff-only draft in pageDrafts/{id} and copied to the
// public pages/{id} on publish, so unpublished wording is never publicly readable.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { addDoc, collection, doc, orderBy, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { MAX_EDGE, formatBytes, prepareImage, uploadToLibrary } from "../media";
import { useAuth } from "../../auth/AuthProvider";
import { list, one, useLoad } from "../data";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";

const NEWS_CATEGORIES = ["School News", "Achievements", "Values in Action", "Events", "SRSS25"];
const EVENT_CATEGORIES = ["Academic", "Parent", "Events", "Seva", "Holidays", "SRSS25"];
const STATUS_OPTIONS = [["draft", "Draft"], ["review", "In review"], ["published", "Published"], ["archived", "Archived"]];
const PAGES = { homepage: "Homepage", about: "About page", faqs: "FAQs" };

function useContentRoles() {
  const { roles = [], user } = useAuth();
  const leader = roles.includes("leadership");
  return { uid: user?.uid, leader, editor: roles.includes("contentEditor"), canWriteCopy: leader || roles.includes("contentEditor"), canWriteEvents: leader || roles.includes("schoolAdmin"), canWriteMedia: leader || roles.includes("contentEditor") || roles.includes("schoolAdmin") };
}

const stampFor = (uid, isNew) => ({ updatedAt: serverTimestamp(), updatedBy: uid, ...(isNew ? { createdAt: serverTimestamp(), createdBy: uid } : {}) });

export function Content() {
  const roles = useContentRoles();
  const [params, setParams] = useSearchParams();
  const tabs = [["news", "News"], ...(roles.canWriteEvents ? [["events", "Public events"]] : []), ...Object.entries(PAGES), ["images", "Image library"]];
  const tab = tabs.some(([id]) => id === params.get("tab")) ? params.get("tab") : "news";
  return <>
    <PageHeader kicker="Public website" title="Content">Editors draft and send for review; leadership publishes. Changes appear on the public website as soon as they are published.</PageHeader>
    <div className="hub-tabs" role="tablist">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setParams({ tab: id })}>{label}</button>)}</div>
    <div className="hub-tab-panel">
      {tab === "news" && <NewsManager roles={roles} />}
      {tab === "events" && <EventManager roles={roles} />}
      {PAGES[tab] && <PageEditor key={tab} pageId={tab} roles={roles} />}
      {tab === "images" && <MediaLibrary roles={roles} />}
    </div>
  </>;
}

// ---------- News ----------
function NewsManager({ roles }) {
  const { data, loading, error, reload } = useLoad(() => list("newsPosts"), []);
  const [editing, setEditing] = useState(null);
  const done = () => { setEditing(null); reload(); };
  return <>
    <ErrorNote error={error} />
    {editing ? <NewsEditor post={editing} roles={roles} onDone={done} onCancel={() => setEditing(null)} />
      : roles.canWriteCopy && <button type="button" className="hub-button" onClick={() => setEditing({ status: "draft", category: NEWS_CATEGORIES[0], date: new Date().toISOString().slice(0, 10) })}>New news post</button>}
    {loading ? <Loading /> : <DataTable rows={data} searchKeys={["title", "category"]} exportName="srss-news" initialSort={{ key: "date", dir: -1 }} onRowClick={(row) => setEditing(row)}
      filters={[{ key: "status", label: "Status", options: STATUS_OPTIONS }, { key: "category", label: "Category", options: NEWS_CATEGORIES.map((item) => [item, item]) }]}
      columns={[{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "date", label: "Date", render: (row) => row.date ? formatDate(row.date) : "—" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }]} />}
  </>;
}

function NewsEditor({ post, roles, onDone, onCancel }) {
  const [fields, setFields] = useState(post);
  const [state, setState] = useState(null);
  const live = post.status === "published";
  const locked = live && !roles.leader;
  const readOnly = !roles.canWriteCopy || locked;
  const set = (key) => (event) => setFields({ ...fields, [key]: event.target.value });
  async function save(status) {
    setState("saving");
    const { id, ...rest } = fields;
    const data = { ...rest, title: rest.title.trim(), status, ...(status === "published" ? { publishedAt: serverTimestamp() } : {}), ...stampFor(roles.uid, !id) };
    try {
      if (id) await updateDoc(doc(db, "newsPosts", id), data); else await addDoc(collection(db, "newsPosts"), { ...data, ownerRole: "contentEditor" });
      onDone();
    } catch (error) { setState(error); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={(event) => { event.preventDefault(); save(roles.leader ? "published" : "review"); }}>
    <div className="hub-card-top"><strong>{post.id ? "Edit news post" : "New news post"}</strong>{post.status && <StatusBadge status={post.status} />}</div>
    {locked && <p className="hub-note">This post is live. Only leadership can change or withdraw published posts.</p>}
    <fieldset disabled={readOnly} className="hub-plain-fieldset">
      <label>Headline<input required maxLength={140} value={fields.title || ""} onChange={set("title")} /></label>
      <div className="hub-form-row">
        <label>Category<select value={fields.category || ""} onChange={set("category")}>{NEWS_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Date<input type="date" required value={fields.date || ""} onChange={set("date")} /></label>
      </div>
      <ImageField label="Image" value={fields.image || ""} onChange={(image) => setFields({ ...fields, image })} roles={roles} />
      <label>Short summary<textarea rows={2} maxLength={300} value={fields.excerpt || ""} onChange={set("excerpt")} /></label>
      <label>Full story (optional)<textarea rows={6} value={fields.content || ""} onChange={set("content")} /></label>
    </fieldset>
    <ErrorNote error={state instanceof Error ? state : null} />
    <div className="hub-form-actions">
      {!readOnly && <button type="button" className="hub-button hub-button-quiet" disabled={state === "saving"} onClick={() => save("draft")}>Save draft</button>}
      {!readOnly && <button type="submit" className="hub-button" disabled={state === "saving"}>{roles.leader ? "Publish" : "Send for review"}</button>}
      {roles.leader && live && <button type="button" className="hub-button hub-button-quiet" onClick={() => save("archived")}>Withdraw (archive)</button>}
      <button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Close</button>
    </div>
  </form>;
}

// Image fields take a library image (or an existing /assets path). `onPick` receives the whole library
// entry so callers can fill a matching alt-text field as well.
function ImageField({ label, value, onChange, onPick, roles }) {
  const [picking, setPicking] = useState(false);
  return <div className="hub-image-picker">
    <label>{label}<span className="hub-image-field"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Choose from the library or paste an image address" />{value && <img src={value} alt="" />}</span></label>
    <div className="hub-form-actions"><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => setPicking(true)}>Choose from library</button>{value && <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => onChange("")}>Remove image</button>}</div>
    {picking && <MediaPicker roles={roles} onClose={() => setPicking(false)} onSelect={(item) => { onChange(item.url); onPick?.(item); setPicking(false); }} />}
  </div>;
}

// ---------- Image library ----------
function useLibrary() {
  return useLoad(async () => (await list("mediaRegistry")).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), []);
}

function MediaLibrary({ roles }) {
  const { data, loading, error, reload } = useLibrary();
  const [uploading, setUploading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  return <>
    <Section title="Image library" action={roles.canWriteMedia && !uploading && <button type="button" className="hub-button hub-button-small" onClick={() => setUploading(true)}>Upload image</button>}>
      <p className="hub-hint">Images here can be used on any public page. Photos are resized to {MAX_EDGE.toLocaleString()} px and compressed when uploaded, and camera details such as location are removed.</p>
      {uploading && <UploadPanel roles={roles} onCancel={() => setUploading(false)} onUploaded={() => { setUploading(false); reload(); }} />}
      <ErrorNote error={error} />
      {loading ? <Loading /> : <MediaGrid items={(data || []).filter((item) => showArchived || item.status !== "archived")} roles={roles} onChanged={reload} />}
      <label className="hub-check"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} /> Show archived images</label>
    </Section>
  </>;
}

function MediaPicker({ roles, onSelect, onClose }) {
  const dialog = useRef(null);
  const { data, loading, error, reload } = useLibrary();
  const [uploading, setUploading] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  // Portal: the picker opens from inside other forms (e.g. the news editor), and forms cannot nest.
  return createPortal(<dialog ref={dialog} className="hub-dialog" aria-labelledby="media-picker-title" onClose={onClose} onCancel={onClose}>
    <div className="hub-dialog-head"><h2 id="media-picker-title">Choose an image</h2><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => dialog.current?.close()}>Close</button></div>
    {roles?.canWriteMedia && (uploading ? <UploadPanel roles={roles} onCancel={() => setUploading(false)} onUploaded={(item) => { reload(); onSelect(item); }} /> : <button type="button" className="hub-button hub-button-small" onClick={() => setUploading(true)}>Upload a new image</button>)}
    <ErrorNote error={error} />
    {loading ? <Loading /> : <MediaGrid items={(data || []).filter((item) => item.status !== "archived")} roles={roles} onSelect={onSelect} />}
  </dialog>, document.body);
}

function MediaGrid({ items, roles, onSelect, onChanged }) {
  const [term, setTerm] = useState("");
  const shown = items.filter((item) => !term.trim() || `${item.alt} ${item.caption} ${item.originalName}`.toLowerCase().includes(term.trim().toLowerCase()));
  if (!items.length) return <EmptyState title="No images yet.">Upload the first image to start the library.</EmptyState>;
  return <>
    <label className="hub-media-search"><span className="hub-visually-hidden">Search images</span><input type="search" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search by description" /></label>
    <ul className="hub-media-grid">{shown.map((item) => <MediaCard key={item.id} item={item} roles={roles} onSelect={onSelect} onChanged={onChanged} />)}</ul>
    {!shown.length && <p className="hub-hint">No images match “{term}”.</p>}
  </>;
}

function MediaCard({ item, roles, onSelect, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(item.alt);
  const [state, setState] = useState(null);
  const canEdit = roles?.canWriteMedia && !onSelect;
  async function save(changes) {
    setState("saving");
    try { await updateDoc(doc(db, "mediaRegistry", item.id), { ...changes, updatedAt: serverTimestamp(), updatedBy: roles.uid }); setEditing(false); setState(null); onChanged?.(); }
    catch (reason) { setState(reason); }
  }
  return <li className={`hub-media-card${item.status === "archived" ? " is-archived" : ""}`}>
    <img src={item.url} alt="" loading="lazy" width={item.width} height={item.height} />
    <div>
      {editing ? <label>Alt text<textarea rows={3} maxLength={250} value={alt} onChange={(event) => setAlt(event.target.value)} /></label> : <p className="hub-media-alt">{item.alt}</p>}
      <p className="hub-hint">{item.width} × {item.height} · {formatBytes(item.bytes || 0)}{item.containsPupils ? " · Pupils shown, consent checked" : ""}</p>
      {item.status === "archived" && <StatusBadge status="archived" />}
      <ErrorNote error={state instanceof Error ? state : null} />
      <div className="hub-form-actions">
        {onSelect && <button type="button" className="hub-button hub-button-small" onClick={() => onSelect(item)}>Use this image</button>}
        {canEdit && (editing
          ? <><button type="button" className="hub-button hub-button-small" disabled={!alt.trim() || state === "saving"} onClick={() => save({ alt: alt.trim() })}>Save alt text</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => { setAlt(item.alt); setEditing(false); }}>Cancel</button></>
          : <><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => setEditing(true)}>Edit alt text</button><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={state === "saving"} onClick={() => save({ status: item.status === "archived" ? "approved" : "archived" })}>{item.status === "archived" ? "Restore" : "Archive"}</button></>)}
      </div>
    </div>
  </li>;
}

function UploadPanel({ roles, onUploaded, onCancel }) {
  const [prepared, setPrepared] = useState(null);
  const [preview, setPreview] = useState("");
  const [fields, setFields] = useState({ alt: "", caption: "", containsPupils: "", consentChecked: false });
  const [state, setState] = useState(null);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  async function choose(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("preparing"); setPrepared(null);
    try { const result = await prepareImage(file); setPrepared(result); setPreview(URL.createObjectURL(result.blob)); setState(null); }
    catch (reason) { setState(reason); }
  }
  async function upload(event) {
    event.preventDefault();
    event.stopPropagation(); // React submit events bubble through portals to any enclosing editor form.
    setState("uploading");
    try {
      const item = await uploadToLibrary({ prepared, alt: fields.alt, caption: fields.caption, containsPupils: fields.containsPupils === "yes", consentChecked: fields.consentChecked, uid: roles.uid });
      onUploaded(item);
    } catch (reason) { setState(reason); }
  }
  const ready = prepared && fields.alt.trim() && fields.containsPupils && (fields.containsPupils === "no" || fields.consentChecked);
  return <form className="hub-form hub-form-wide hub-upload" onSubmit={upload}>
    <label>Image file<input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} required /></label>
    <small className="hub-hint">JPEG, PNG or WebP. Large photos are resized and compressed automatically.</small>
    {state === "preparing" && <p className="hub-hint" role="status">Preparing image…</p>}
    {prepared && <div className="hub-upload-preview"><img src={preview} alt="" /><p className="hub-hint">{prepared.width} × {prepared.height} · {formatBytes(prepared.blob.size)}{prepared.originalBytes > prepared.blob.size ? ` (was ${formatBytes(prepared.originalBytes)})` : ""}</p></div>}
    <label>Describe the image (alt text)<textarea rows={2} required maxLength={250} value={fields.alt} onChange={(event) => setFields({ ...fields, alt: event.target.value })} placeholder="e.g. Standard 3 pupils planting seedlings in the values garden" /></label>
    <label>Caption (optional)<input maxLength={200} value={fields.caption} onChange={(event) => setFields({ ...fields, caption: event.target.value })} /></label>
    <fieldset className="hub-plain-fieldset"><legend className="hub-legend">Does this photo show pupils?</legend>
      <div className="hub-form-actions">{[["yes", "Yes"], ["no", "No"]].map(([value, label]) => <label key={value} className="hub-check"><input type="radio" name="containsPupils" value={value} checked={fields.containsPupils === value} onChange={() => setFields({ ...fields, containsPupils: value, consentChecked: false })} /> {label}</label>)}</div>
    </fieldset>
    {fields.containsPupils === "yes" && <label className="hub-check"><input type="checkbox" checked={fields.consentChecked} onChange={(event) => setFields({ ...fields, consentChecked: event.target.checked })} /> I have checked that every pupil shown has public-media consent on record.</label>}
    <ErrorNote error={state instanceof Error ? state : null} />
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={!ready || state === "uploading"}>{state === "uploading" ? "Uploading…" : "Upload to library"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Cancel</button></div>
  </form>;
}

// ---------- Public events ----------
function EventManager({ roles }) {
  const { data, loading, error, reload } = useLoad(() => list("events"), []);
  const [editing, setEditing] = useState(null);
  const done = () => { setEditing(null); reload(); };
  return <>
    <ErrorNote error={error} />
    {editing ? <EventEditor event={editing} roles={roles} onDone={done} onCancel={() => setEditing(null)} />
      : <button type="button" className="hub-button" onClick={() => setEditing({ status: "published", publicListing: true, category: EVENT_CATEGORIES[0], audienceKeys: ["school"] })}>New event</button>}
    {loading ? <Loading /> : <DataTable rows={data} searchKeys={["title", "category"]} exportName="srss-events" initialSort={{ key: "date", dir: 1 }} onRowClick={(row) => setEditing(row)}
      filters={[{ key: "category", label: "Category", options: EVENT_CATEGORIES.map((item) => [item, item]) }]}
      columns={[{ key: "title", label: "Event" }, { key: "date", label: "Date", render: (row) => formatDate(row.date) }, { key: "publicListing", label: "Public website", render: (row) => row.publicListing ? "Shown" : "Hub only" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }]} />}
  </>;
}

function EventEditor({ event, roles, onDone, onCancel }) {
  const [fields, setFields] = useState(event);
  const [state, setState] = useState(null);
  const set = (key) => (change) => setFields({ ...fields, [key]: change.target.value });
  async function save(change) {
    change.preventDefault(); setState("saving");
    const { id, ...rest } = fields;
    const data = { ...rest, title: rest.title.trim(), audienceKeys: rest.audienceKeys?.length ? rest.audienceKeys : ["school"], ...stampFor(roles.uid, !id) };
    try {
      if (id) await updateDoc(doc(db, "events", id), data); else await addDoc(collection(db, "events"), data);
      onDone();
    } catch (error) { setState(error); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={save}>
    <div className="hub-card-top"><strong>{event.id ? "Edit event" : "New event"}</strong></div>
    <label>Event<input required maxLength={140} value={fields.title || ""} onChange={set("title")} /></label>
    <div className="hub-form-row">
      <label>Date<input type="date" required value={fields.date || ""} onChange={set("date")} /></label>
      <label>Time<input value={fields.time || ""} onChange={set("time")} placeholder="9.30–11.30 am" /></label>
      <label>Category<select value={fields.category || ""} onChange={set("category")}>{EVENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <label>Location<input value={fields.location || ""} onChange={set("location")} /></label>
    <label>Short description<textarea rows={2} maxLength={300} value={fields.excerpt || ""} onChange={set("excerpt")} /></label>
    <label className="hub-check"><input type="checkbox" checked={!!fields.publicListing} onChange={(change) => setFields({ ...fields, publicListing: change.target.checked })} /> Show on the public website calendar</label>
    <label>Status<select value={fields.status} onChange={set("status")}><option value="published">Published</option><option value="draft">Draft (hidden)</option><option value="archived">Archived</option></select></label>
    <ErrorNote error={state instanceof Error ? state : null} />
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state === "saving"}>Save event</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Close</button></div>
  </form>;
}

// ---------- Page copy (homepage, About, FAQs) ----------
function PageEditor({ pageId, roles }) {
  const { data, loading, error, reload } = useLoad(async () => {
    const [live, draft] = await Promise.all([one(`pages/${pageId}`), one(`pageDrafts/${pageId}`)]);
    return { live, draft };
  }, [pageId]);
  const [content, setContent] = useState(null);
  const [state, setState] = useState(null);
  useEffect(() => { if (data) setContent(structuredClone(data.draft?.content || data.live?.content || {})); }, [data]);
  if (loading || !content) return error ? <ErrorNote error={error} /> : <Loading />;
  const readOnly = !roles.canWriteCopy;
  const pending = data.draft && data.draft.status !== "published";
  async function saveDraft(status) {
    setState("saving");
    try { await setDoc(doc(db, "pageDrafts", pageId), { content, status, ...stampFor(roles.uid, !data.draft) }); setState(status === "review" ? "sent" : "saved"); reload(); }
    catch (reason) { setState(reason); }
  }
  async function publish() {
    setState("saving");
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "pages", pageId), { content, status: "published", publishedAt: serverTimestamp(), publishedBy: roles.uid, ...stampFor(roles.uid, !data.live) });
      batch.set(doc(db, "pageDrafts", pageId), { content, status: "published", ...stampFor(roles.uid, !data.draft) });
      await batch.commit(); setState("published"); reload();
    } catch (reason) { setState(reason); }
  }
  return <>
    <Section title={PAGES[pageId]} action={<span className="hub-inline-status">{pending ? <StatusBadge status={data.draft.status} label={data.draft.status === "review" ? "Draft waiting for review" : "Unpublished draft"} /> : data.live ? <StatusBadge status="published" label="Live" /> : <StatusBadge status="missing" label="Not yet published" />}</span>}>
      <p className="hub-hint">{data.live?.updatedAt ? <>Live version last published {formatDate(data.live.publishedAt || data.live.updatedAt)}. </> : null}Edits are saved as a draft first; the public page changes only when leadership publishes.</p>
      {pageId === "faqs" && <p className="hub-hint">Each answer is a list of paragraphs. The homepage shows the first questions; all appear on the FAQ page.</p>}
      <fieldset disabled={readOnly} className="hub-plain-fieldset">
        <StructuredField value={content} onChange={setContent} label={PAGES[pageId]} roles={roles} root />
      </fieldset>
      <ErrorNote error={state instanceof Error ? state : null} />
      {state === "saved" && <p className="hub-note" role="status">Draft saved.</p>}
      {state === "sent" && <p className="hub-note" role="status">Sent to leadership for review.</p>}
      {state === "published" && <p className="hub-note" role="status">Published — the public website now shows this version.</p>}
      {!readOnly && <div className="hub-form-actions hub-sticky-actions">
        <button type="button" className="hub-button hub-button-quiet" disabled={state === "saving"} onClick={() => saveDraft("draft")}>Save draft</button>
        {roles.leader ? <button type="button" className="hub-button" disabled={state === "saving"} onClick={publish}>Publish to website</button>
          : <button type="button" className="hub-button" disabled={state === "saving"} onClick={() => saveDraft("review")}>Send for review</button>}
        <button type="button" className="hub-button hub-button-quiet" disabled={state === "saving"} onClick={() => setContent(structuredClone(data.live?.content || {}))}>Discard changes (back to live)</button>
      </div>}
    </Section>
  </>;
}

const humanise = (key) => String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());
const blankLike = (sample) => Array.isArray(sample) ? [] : sample && typeof sample === "object" ? Object.fromEntries(Object.keys(sample).map((key) => [key, blankLike(sample[key])])) : typeof sample === "number" ? 0 : typeof sample === "boolean" ? false : "";

// Renders any JSON-shaped page content as labelled fields, so new copy fields need no new editor code.
function StructuredField({ value, onChange, label, roles, root = false }) {
  if (Array.isArray(value)) {
    const update = (index, next) => onChange(value.map((item, i) => (i === index ? next : item)));
    const move = (index, offset) => { const next = [...value]; const [item] = next.splice(index, 1); next.splice(index + offset, 0, item); onChange(next); };
    return <fieldset className="hub-struct-list"><legend>{label}</legend>
      {value.map((item, index) => <div className="hub-struct-item" key={index}>
        <StructuredField value={item} onChange={(next) => update(index, next)} label={`${label.replace(/s$/, "")} ${index + 1}`} roles={roles} />
        <div className="hub-form-actions"><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={index === value.length - 1} onClick={() => move(index, 1)}>Move down</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove</button></div>
      </div>)}
      <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => onChange([...value, value.length ? blankLike(value[0]) : ""])}>Add {label.replace(/s$/, "").toLowerCase()}</button>
    </fieldset>;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([key]) => !["updatedAt", "createdAt"].includes(key));
    const altKeyFor = (key) => key.replace(/image$/i, (match) => (match[0] === "I" ? "Alt" : "alt"));
    const body = entries.map(([key, item]) => typeof item === "string" && /image$/i.test(key)
      ? <ImageField key={key} label={humanise(key)} value={item} roles={roles} onChange={(next) => onChange({ ...value, [key]: next })} onPick={(picked) => { if (altKeyFor(key) in value) onChange({ ...value, [key]: picked.url, [altKeyFor(key)]: picked.alt }); }} />
      : <StructuredField key={key} value={item} label={humanise(key)} roles={roles} onChange={(next) => onChange({ ...value, [key]: next })} />);
    return root ? <div className="hub-struct">{body}</div> : <details className="hub-struct-group" open={entries.length <= 4}><summary>{label}</summary><div className="hub-struct">{body}</div></details>;
  }
  if (typeof value === "boolean") return <label className="hub-check"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
  if (typeof value === "number") return <label>{label}<input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
  const text = value ?? "";
  if (/image$/i.test(label)) return <ImageField label={label} value={text} onChange={onChange} roles={roles} />;
  return <label>{label}{text.length > 80 || text.includes("\n") ? <textarea rows={Math.min(8, Math.ceil(text.length / 90) + 1)} value={text} onChange={(event) => onChange(event.target.value)} /> : <input value={text} onChange={(event) => onChange(event.target.value)} />}</label>;
}

// ---------- Website inbox ----------
export function Inbox() {
  const { roles = [], user } = useAuth();
  const canUpdate = roles.includes("schoolAdmin") || roles.includes("leadership");
  const { data, loading, error, reload } = useLoad(() => list("contactMessages", orderBy("createdAt", "desc")), []);
  async function markHandled(message) { await updateDoc(doc(db, "contactMessages", message.id), { status: "handled", handledBy: user.uid, handledAt: serverTimestamp() }); reload(); }
  return <>
    <PageHeader kicker="Public website" title="Website inbox">Messages sent through the website contact form. Admissions enquiries appear under Admissions.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No messages yet." /> : <ul className="hub-list hub-list-feed">{data.map((message) => <li key={message.id} className={message.status === "new" ? "hub-unread" : ""}>
      <div className="hub-card-top"><strong>{message.subject} · {message.name}</strong><StatusBadge status={message.status} label={message.status === "handled" ? "Handled" : undefined} /></div>
      <p className="hub-hint">{formatDate(message.createdAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
      <p className="hub-pre">{message.message}</p>
      <div className="hub-form-actions"><a className="hub-button hub-button-quiet hub-button-small" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject} — SRSS`)}`}>Reply by email</a>{canUpdate && message.status === "new" && <button type="button" className="hub-button hub-button-small" onClick={() => markHandled(message)}>Mark as handled</button>}</div>
    </li>)}</ul>}
  </>;
}
