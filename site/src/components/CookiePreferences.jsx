import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (!open || !dialog.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => document.documentElement.style.setProperty('--cookie-sheet-height', `${entry.target.getBoundingClientRect().height}px`));
    observer.observe(dialog.current);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--cookie-sheet-height'); };
  }, [open, step]);

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
      <div className="cookie-heading"><div><p className="eyebrow">{step === 'notice' ? 'A little welcome' : 'Make yourself at home'}</p><h2 id="cookie-title">{step === 'notice' ? 'Cookies? Sadly, not the chocolate-chip kind 🍪' : 'Let me choose'}</h2></div></div>
      <p id="cookie-intro">{step === 'notice' ? 'Ours just help the site remember you and run smoothly, so every visit feels a little more like home. Pick what you’re comfortable with.' : 'A few small choices. You can change them any time in the footer.'}</p>
      {step === 'details' && <div className="cookie-options">
        <div className="cookie-option"><div><strong>Essentials</strong><p>Keep the site working. Always on.</p></div><span className="cookie-required">Always on</span></div>
        <div className="cookie-option"><div><strong>Analytics</strong><p>Help us see which pages families find useful.</p><p>No analytics tools are installed.</p></div><span className="cookie-required">Not in use</span></div>
        <label className="cookie-option"><div><strong>Media</strong><p>Let videos and maps load from YouTube and Google.</p></div><input aria-label="Allow media" type="checkbox" checked={draft.externalMedia} onChange={(event) => setDraft((current) => ({ ...current, externalMedia: event.target.checked }))} /></label>
        <label className="cookie-option"><div><strong>Remember my hub</strong><p>Open your usual school hub on this device.</p></div><input aria-label="Remember my hub" type="checkbox" checked={draft.functional} onChange={(event) => setDraft((current) => ({ ...current, functional: event.target.checked }))} /></label>
      </div>}
      <div className="cookie-buttons">{step === 'notice' ? <><button type="button" className="cookie-accept" onClick={() => save({ functional: true, externalMedia: true })}>Sounds good!</button><button type="button" className="cookie-decline" onClick={() => save({ functional: false, externalMedia: false })}>Just the essentials</button><button type="button" className="cookie-manage" onClick={() => setStep('details')}>Let me choose</button></> : <button type="button" className="cookie-accept cookie-save" onClick={() => save(draft)}>Save my choices</button>}</div>
      <p className="cookie-note"><a href="/legal/cookies">Read our cookie policy</a></p>
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
