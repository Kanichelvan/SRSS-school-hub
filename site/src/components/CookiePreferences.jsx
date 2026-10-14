import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { COOKIE_PREFERENCES_KEY, parsePreferences, preferenceRecord } from '../lib/cookiePreferences.js';

const CookieContext = createContext(null);
const read = () => { try { return parsePreferences(localStorage.getItem(COOKIE_PREFERENCES_KEY)); } catch { return null; } };

export function CookiePreferencesProvider({ children }) {
  const [record, setRecord] = useState(read);
  const [open, setOpen] = useState(() => !read());
  const [step, setStep] = useState('notice');
  const [draft, setDraft] = useState({ functional: false, externalMedia: false });
  const dialog = useRef(null);
  const preferences = useMemo(() => ({ functional: record?.functional === true, externalMedia: record?.externalMedia === true }), [record]);
  const openPreferences = useCallback(() => { setStep('details'); setOpen(true); }, []);
  const save = useCallback((choices) => {
    const next = preferenceRecord(choices);
    try { localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(next)); } catch { /* Apply the choice for this session when storage is unavailable. */ }
    setRecord(next); setOpen(false);
  }, []);

  useEffect(() => {
    const sync = (event) => { if (event.key === COOKIE_PREFERENCES_KEY || event.key === null) { const next = read(); setRecord(next); if (!next) { setStep('notice'); setOpen(true); } } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    setDraft(preferences);
    if (step !== 'details') return undefined;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    const appRoot = document.getElementById('root');
    const wasInert = appRoot?.inert;
    if (appRoot) appRoot.inert = true;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { if (appRoot) appRoot.inert = wasInert; document.body.style.overflow = overflow; if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [open, preferences, step]);

  const close = () => record ? setOpen(false) : save({ functional: false, externalMedia: false });
  const trap = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key !== 'Tab' || step !== 'details') return;
    const nodes = [...dialog.current.querySelectorAll('button, a[href], input:not(:disabled)')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
  };

  return <CookieContext.Provider value={{ preferences, openPreferences }}>
    {children}
    {open && createPortal(<div className={`cookie-overlay cookie-${step}`}><section ref={dialog} className="cookie-dialog" role="dialog" aria-modal={step === 'details' ? true : undefined} aria-labelledby="cookie-title" aria-describedby="cookie-intro" tabIndex={-1} onKeyDown={trap}>
      <button type="button" className="cookie-dismiss" onClick={close} aria-label="Close cookie choices"><X size={20} /></button>
      <div className="cookie-heading"><span className="cookie-shield" aria-hidden="true"><ShieldCheck size={25} /></span><div><p className="eyebrow">{step === 'notice' ? 'Cookie choices' : 'Privacy preferences'}</p><h2 id="cookie-title">{step === 'notice' ? 'Your privacy, your choice' : 'Cookie preferences'}</h2></div></div>
      <p id="cookie-intro">{step === 'notice' ? 'Essential storage keeps SRSS secure and reliable. Accept optional services, decline, or choose your preferences.' : 'Essential services stay on. Choose which optional features to allow.'}</p>
      {step === 'details' && <div className="cookie-options">
        <div className="cookie-option"><div><strong>Essential</strong><p>Security, sign-in and core school services.</p></div><span className="cookie-required">Always on</span></div>
        <label className="cookie-option"><div><strong>Remember my hub</strong><p>Remember your hub on this device.</p></div><input type="checkbox" checked={draft.functional} onChange={(event) => setDraft((current) => ({ ...current, functional: event.target.checked }))} /></label>
        <label className="cookie-option"><div><strong>External maps and videos</strong><p>Allow Google Maps and YouTube embeds.</p></div><input type="checkbox" checked={draft.externalMedia} onChange={(event) => setDraft((current) => ({ ...current, externalMedia: event.target.checked }))} /></label>
      </div>}
      <div className="cookie-buttons"><button type="button" className="cookie-accept" onClick={() => save({ functional: true, externalMedia: true })}>Accept</button><button type="button" className="cookie-decline" onClick={() => save({ functional: false, externalMedia: false })}>Decline</button>{step === 'notice' ? <button type="button" className="cookie-manage" onClick={() => setStep('details')}>Manage preferences</button> : <button type="button" className="cookie-manage" onClick={() => save(draft)}>Save preferences</button>}</div>
      <p className="cookie-note">{step === 'details' && <>No advertising or analytics trackers. Change your choices in the footer. </>}<a href="/legal/cookies">Read our Cookies Policy</a>.</p>
    </section></div>, document.body)}
  </CookieContext.Provider>;
}

export function useCookiePreferences() {
  const context = useContext(CookieContext);
  if (!context) throw new Error('CookiePreferencesProvider is required.');
  return context;
}

export function CookiePreferencesButton() {
  const { openPreferences } = useCookiePreferences();
  return <button className="cookie-preferences-link" type="button" onClick={openPreferences}>Cookie preferences</button>;
}

export function SchoolMap() {
  const { preferences, openPreferences } = useCookiePreferences();
  return preferences.externalMedia ? <iframe title="Map showing Sekolah Rendah Sathya Sai" src="https://www.google.com/maps?q=6%20Jalan%20Puchong%20Taman%20Tan%20Yew%20Lai%2058200%20Kuala%20Lumpur&output=embed" loading="lazy" /> : <div className="map-preferences"><h3>Visit SRSS</h3><p>6, Jalan Puchong, Taman Tan Yew Lai,<br />58200 Kuala Lumpur</p><p>The interactive map uses Google Maps and loads only when external maps and videos are allowed.</p><button type="button" onClick={openPreferences}>Choose map preferences</button><a href="https://maps.google.com/?q=6+Jalan+Puchong+Taman+Tan+Yew+Lai+58200+Kuala+Lumpur" target="_blank" rel="noreferrer">Open directions in Google Maps</a></div>;
}
