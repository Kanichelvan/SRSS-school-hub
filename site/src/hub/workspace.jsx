// Unified Google Workspace actions (shared by every module): <WorkspaceActionModal />, the resource
// buttons that open it, and the attachment list. The modal returns structured metadata
// ({ provider, kind, fileId, title, url, addedBy, addedAt }) to the calling module; it never stores tokens.
//
// Modes: "attach" (link an existing Drive/Docs/Sheets/Slides/Forms file) and "create" (open Google's own
// editor to create a Doc, Sheet, Slides or Form, then attach it). Drive browsing with the Picker and API
// creation from school templates plug in here once the Workspace connection centre (Stage 5) exists.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../auth/AuthProvider";
import { CREATABLE_KINDS, WORKSPACE_KINDS, addAttachment, makeAttachment, parseGoogleUrl } from "./logic/workspace";

const KIND_MARK = { document: "Doc", spreadsheet: "Sheet", presentation: "Slides", form: "Form", file: "File", folder: "Folder" };

export function KindMark({ kind }) {
  return <span className={`hub-ws-kind hub-ws-k-${kind}`} aria-hidden="true">{KIND_MARK[kind] || "File"}</span>;
}

export function WorkspaceActionModal({ mode = "attach", kind: initialKind = "document", accept, context, onConfirm, onClose }) {
  const auth = useAuth();
  const dialog = useRef(null);
  const [kind, setKind] = useState(initialKind);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { dialog.current?.showModal(); }, []);

  const parsed = parseGoogleUrl(link);
  const allowed = accept ? accept.includes(parsed?.kind) : true;
  const creating = mode === "create";
  const heading = creating ? `Create a ${WORKSPACE_KINDS[kind].label}` : accept?.length === 1 ? `Attach a ${WORKSPACE_KINDS[accept[0]].label}` : "Attach from Google Drive";

  function confirm(event) {
    // The modal is portalled out of the DOM, but React events still bubble through the component tree:
    // without this the calling module's own form would submit too.
    event.preventDefault(); event.stopPropagation();
    setError(null);
    if (!parsed) return setError("That doesn't look like a Google Drive, Docs, Sheets, Slides or Forms link. Use “Share → Copy link” in Google and paste it here.");
    if (!allowed) return setError(`Please attach a ${accept.map((item) => WORKSPACE_KINDS[item].label).join(" or ")}.`);
    try { onConfirm(makeAttachment(parsed, { title, uid: auth.user?.uid })); dialog.current?.close(); } catch (reason) { setError(reason.message); }
  }

  // Portal: the modal opens from inside module forms, and forms cannot nest.
  return createPortal(<dialog ref={dialog} className="hub-dialog hub-ws-dialog" aria-labelledby="ws-title" onClose={onClose} onCancel={onClose}>
    <form onSubmit={confirm} className="hub-ws-form">
      <div className="hub-dialog-head"><span className="hub-ws-title"><KindMark kind={creating ? kind : parsed?.kind || accept?.[0] || "file"} /><h2 id="ws-title">{heading}</h2></span><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => dialog.current?.close()}>Close</button></div>
      {context && <p className="hub-ws-context">{context}</p>}
      {creating && <>
        <fieldset className="hub-ws-kinds"><legend className="hub-visually-hidden">File type</legend>{CREATABLE_KINDS.filter((item) => !accept || accept.includes(item)).map((item) => <label key={item} className={kind === item ? "active" : ""}><input type="radio" name="ws-kind" value={item} checked={kind === item} onChange={() => { setKind(item); setOpened(false); }} /><KindMark kind={item} />{WORKSPACE_KINDS[item].label}</label>)}</fieldset>
        <ol className="hub-ws-steps">
          <li><strong>Create it in Google {WORKSPACE_KINDS[kind].service}.</strong> It opens in a new tab, signed in with your school account, and is saved in your Drive.<div><a className="hub-button hub-button-small" href={WORKSPACE_KINDS[kind].create} target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>Open Google {WORKSPACE_KINDS[kind].service}</a></div></li>
          <li><strong>Name it, then copy its link</strong> (Share → Copy link) and paste it below.</li>
        </ol>
      </>}
      <label>Link to the {creating ? `new ${WORKSPACE_KINDS[kind].label}` : "file"}<input type="url" inputMode="url" required autoFocus={!creating} value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://docs.google.com/…" aria-describedby="ws-detected" /></label>
      <p id="ws-detected" className="hub-ws-detected" aria-live="polite">{link ? (parsed ? (allowed ? <>Recognised: <strong>{WORKSPACE_KINDS[parsed.kind].label}</strong></> : `This is a ${WORKSPACE_KINDS[parsed.kind].label}; this action needs a ${accept.map((item) => WORKSPACE_KINDS[item].label).join(" or ")}.`) : "Not a Google Workspace link yet.") : creating && opened ? "Waiting for the link of your new file." : " "}</p>
      <label>Title shown in the hub <span className="hub-optional">optional</span><input maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={parsed ? WORKSPACE_KINDS[parsed.kind].label : "e.g. Fractions worksheet"} /></label>
      <p className="hub-ws-note">The hub keeps only a reference to this file. Who can open it is decided by its sharing settings in Google Drive — keep pupils’ private work restricted to the people who need it.</p>
      {error && <p className="hub-error" role="alert">{error}</p>}
      <div className="hub-form-actions hub-ws-actions">
        <button type="submit" className="hub-button" disabled={!parsed || !allowed}>{creating ? "Attach new file" : "Attach"}</button>
        <button type="button" className="hub-button hub-button-quiet" onClick={() => dialog.current?.close()}>Cancel</button>
      </div>
    </form>
  </dialog>, document.body);
}

// The contextual "Add resource" row. `actions` chooses which Workspace actions a module offers.
const ACTION_LABELS = { attach: "Attach from Google Drive", document: "Create Google Doc", spreadsheet: "Create Google Sheet", presentation: "Create Google Slides", form: "Attach Google Form" };
export function AddResource({ actions = ["attach", "document", "presentation", "form"], context, onAdd, label = "Add a resource" }) {
  const [open, setOpen] = useState(null);
  return <div className="hub-ws-add" role="group" aria-label={label}>
    {actions.map((action) => <button key={action} type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => setOpen(action)}>{ACTION_LABELS[action]}</button>)}
    {open && <WorkspaceActionModal mode={["document", "spreadsheet", "presentation"].includes(open) ? "create" : "attach"} kind={open === "attach" ? "document" : open} accept={open === "form" ? ["form"] : undefined} context={context} onConfirm={onAdd} onClose={() => setOpen(null)} />}
  </div>;
}

export function AttachmentList({ items, onRemove, empty = "No resources attached yet." }) {
  if (!items?.length) return <p className="hub-ws-empty">{empty}</p>;
  return <ul className="hub-ws-list">{items.map((item) => <li key={item.fileId}>
    <KindMark kind={item.kind} />
    <span><strong>{item.title}</strong><small>{WORKSPACE_KINDS[item.kind]?.label}</small></span>
    <a className="hub-button hub-button-quiet hub-button-small" href={item.url} target="_blank" rel="noreferrer">Open in Google<span className="hub-visually-hidden"> (new tab)</span></a>
    {onRemove && <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => onRemove(item)} aria-label={`Remove ${item.title}`}>Remove</button>}
  </li>)}</ul>;
}

// Convenience for modules keeping attachments in component state.
export const withAttachment = (list, attachment) => addAttachment(list, attachment);
