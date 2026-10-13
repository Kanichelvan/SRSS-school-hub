// A shared governed attachment entry point. Drive keeps its own access controls; no sharing changes.
import { useEffect, useRef, useState } from 'react';
export function WorkspaceActionModal({ onAttach, onClose }) {
  const dialog = useRef(null);
  const [label, setLabel] = useState(''); const [url, setUrl] = useState(''); const [error, setError] = useState('');
  useEffect(() => { const node = dialog.current; node.showModal(); return () => node.close(); }, []);
  return <dialog ref={dialog} className="quest-dialog" onCancel={onClose} aria-labelledby="workspace-title"><form className="hub-form" onSubmit={(e) => {
    e.preventDefault();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !['drive.google.com', 'docs.google.com', 'forms.gle'].includes(parsed.hostname) || parsed.username || parsed.password) throw new Error();
      onAttach({ label: label.trim(), url: parsed.href, provider: 'googleWorkspace' }); onClose();
    } catch { setError('Use an authorised Google Drive, Docs, Slides, Sheets or Forms link.'); }
  }}><h2 id="workspace-title">Attach a Workspace resource</h2><p>Use a file you are authorised to share with the reviewer. Google controls who can open it. Attaching a link does not publish the file or change its permissions.</p><label>Resource title<input required maxLength={160} value={label} onChange={(e) => setLabel(e.target.value)} autoFocus /></label><label>Google Workspace link<input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} /></label>{error && <p role="alert" className="hub-error">{error}</p>}<div className="hub-form-actions"><button className="hub-button">Attach link</button><button type="button" className="hub-button hub-button-quiet" onClick={onClose}>Cancel</button></div></form></dialog>;
}
export function WorkspaceAttachments({ resources = [], onChange }) {
  const [open, setOpen] = useState(false);
  return <div className="quest-attachments"><ul>{resources.map((r, i) => <li key={`${r.url}-${i}`}><a href={r.url} target="_blank" rel="noreferrer">{r.label}</a>{onChange && <button type="button" className="hub-button hub-button-small hub-button-quiet" aria-label={`Remove ${r.label}`} onClick={() => onChange(resources.filter((_, n) => n !== i))}>Remove</button>}</li>)}</ul>{onChange && resources.length < 8 && <button type="button" className="hub-button hub-button-quiet" onClick={() => setOpen(true)}>Attach Google resource</button>}{open && <WorkspaceActionModal onClose={() => setOpen(false)} onAttach={(r) => onChange([...resources, r])} />}</div>;
}
