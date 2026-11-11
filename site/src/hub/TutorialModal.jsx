import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase-firestore';
import { useAuth } from '../auth/AuthProvider';
import { hubsFor } from '../auth/permissions';
import { TUTORIALS, TUTORIAL_VERSION, cleanTutorialProgress, tutorialLinkAllowed } from './logic/tutorials';
import './tutorials.css';

export function TutorialButton({ hub, className = 'hub-topbar-link' }) {
  const auth = useAuth(), trigger = useRef(null);
  const [open, setOpen] = useState(false);
  if (!TUTORIALS[hub] || !auth.user || !hubsFor(auth.roles).includes(hub)) return null;
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  return <><button ref={trigger} type="button" className={`${className} hub-tutorial-trigger`} onClick={() => setOpen(true)} aria-haspopup="dialog">How to use this hub</button>{open && <TutorialDialog key={`${auth.user.uid}-${hub}`} hub={hub} onClose={close} />}</>;
}

function TutorialDialog({ hub, onClose }) {
  const auth = useAuth(), guide = TUTORIALS[hub], dialog = useRef(null), heading = useRef(null), titleId = useId();
  const [completed, setCompleted] = useState([]), [index, setIndex] = useState(0), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState(''), [reload, setReload] = useState(0);
  const alive = useRef(true);
  const lesson = guide.lessons[index], isRead = completed.includes(lesson.id);
  const links = lesson.links.filter(([path]) => tutorialLinkAllowed(path, auth.roles, auth.claims));
  useEffect(() => {
    const node = dialog.current, previousOverflow = document.body.style.overflow;
    alive.current = true; node.showModal(); document.body.style.overflow = 'hidden';
    return () => { alive.current = false; node.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    let mounted = true;
    setLoading(true); setError('');
    getDoc(doc(db, 'tutorialProgress', `${auth.user.uid}_${hub}`)).then(snapshot => {
      if (!mounted) return;
      const progress = cleanTutorialProgress(hub, snapshot.data()?.completed);
      setCompleted(progress);
      const next = guide.lessons.findIndex(item => !progress.includes(item.id));
      setIndex(next >= 0 ? next : 0);
    }).catch(reason => { if (mounted) setError(reason.code === 'permission-denied' ? 'Your guide progress could not be loaded. Ask the school office to check your account access.' : 'Your saved guide progress could not be loaded. Check your connection and try again.'); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [auth.user.uid, hub, reload]);
  function move(next) { setIndex(next); setMessage(''); requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'nearest' }); }); }
  async function toggleRead() {
    const id = lesson.id, reading = !isRead;
    setBusy(true); setError(''); setMessage('');
    try {
      const progress = await runTransaction(db, async transaction => {
        const reference = doc(db, 'tutorialProgress', `${auth.user.uid}_${hub}`);
        const snapshot = await transaction.get(reference);
        const existing = cleanTutorialProgress(hub, snapshot.data()?.completed);
        const next = cleanTutorialProgress(hub, reading ? [...existing, id] : existing.filter(item => item !== id));
        transaction.set(reference, { ownerUid: auth.user.uid, hub, version: TUTORIAL_VERSION, completed: next, updatedAt: serverTimestamp() });
        return next;
      });
      if (alive.current) { setCompleted(progress); setMessage(reading ? 'Guide step marked as read. Your progress is saved to your account.' : 'Guide step marked to revisit. Your progress is saved.'); }
    } catch (reason) { if (alive.current) setError(reason.code === 'permission-denied' ? 'Your account cannot save this guide record. Ask the school office to check access.' : 'Your progress was not saved. Check your connection, then try again.'); }
    finally { if (alive.current) setBusy(false); }
  }
  return <dialog ref={dialog} className={`hub-tutorial hub-tutorial-${hub}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (!busy && event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <header className="tutorial-header"><div><p className="tutorial-eyebrow">SRSS Digital Hub · {hub === 'admin' ? 'School team' : hub}</p><h2 id={titleId}>{guide.title}</h2></div><button autoFocus type="button" className="tutorial-close" onClick={onClose} disabled={busy}>Close guide</button></header>
    <div className="tutorial-intro"><p>{guide.introduction}</p><div className="tutorial-progress"><span>{completed.length} of {guide.lessons.length} guide steps read</span><progress value={completed.length} max={guide.lessons.length} aria-label="Guide steps read" /></div><p className="tutorial-note">Reading a guide step does not submit a form, give consent or complete the school task. Use the linked screen to carry out the action.</p></div>
    {loading ? <p role="status" className="tutorial-loading">Loading your saved guide progress…</p> : <div className="tutorial-layout">
      <nav className="tutorial-nav" aria-label="Guide steps"><ol>{guide.lessons.map((item, i) => <li key={item.id}><button type="button" aria-current={index === i ? 'step' : undefined} onClick={() => move(i)} disabled={busy}><span className="tutorial-number" aria-hidden="true">{i + 1}</span><span>{item.title}<small>{completed.includes(item.id) ? 'Read' : 'To read'}</small></span></button></li>)}</ol></nav>
      <section className="tutorial-lesson" aria-labelledby={`${titleId}-lesson`}><p className="tutorial-eyebrow">Step {index + 1} of {guide.lessons.length}</p><h3 id={`${titleId}-lesson`} ref={heading} tabIndex={-1}>{lesson.title}</h3><p className="tutorial-aim">{lesson.aim}</p><ol className="tutorial-instructions">{lesson.steps.map((step, i) => <li key={i}>{step}</li>)}</ol>{lesson.note && <p className="tutorial-callout">{lesson.note}</p>}
        {!!links.length && <div className="tutorial-actions">{links.map(([path, label]) => <Link to={path} key={path} className="hub-button hub-button-quiet" onClick={event => { if (busy) event.preventDefault(); else onClose(); }}>{label}</Link>)}</div>}
        {!!lesson.links.length && !links.length && <p className="tutorial-note">This action belongs to another school role. Ask the responsible colleague or school office for help.</p>}
        <div className="tutorial-completion"><button type="button" className="hub-button" onClick={toggleRead} disabled={busy || loading}>{busy ? 'Saving progress…' : isRead ? 'Mark this guide step to revisit' : 'Mark this guide step as read'}</button><p role="status">{message}</p></div>
        <div className="tutorial-paging"><button type="button" className="hub-button hub-button-quiet" onClick={() => move(index - 1)} disabled={busy || index === 0}>Previous step</button>{index < guide.lessons.length - 1 ? <button type="button" className="hub-button hub-button-quiet" disabled={busy} onClick={() => move(index + 1)}>Next step</button> : <button type="button" className="hub-button hub-button-quiet" disabled={busy} onClick={onClose}>Return to my hub</button>}</div>
      </section>
    </div>}
    {error && <div className="tutorial-error" role="alert"><p>{error}</p><button type="button" className="hub-button hub-button-quiet" disabled={busy || loading} onClick={() => setReload(v => v + 1)}>Reload saved progress</button></div>}
  </dialog>;
}
