import { HubFooter } from "./HubApp";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { authErrorMessage } from "../auth/authErrors";
import { emulatorHost, usingEmulators } from "../lib/firebase";
import { DEFAULT_SIGN_IN_INTRO, OFFICE_CONTACT, SIGN_IN_HELP, audienceFromSearch } from "./logic/signIn";

// Developer-only accounts created by scripts/seed-emulator.mjs (password defined there). They exist only on the
// local test database, so they are offered only on a developer's machine and only while that database is running.
const DEMO_PASSWORD = "srss-demo-only";
const DEMO_ACCOUNTS = [["superadmin", "Super admin"], ["office", "Office admin"], ["principal", "Headmistress"], ["coordinator", "Academic coordinator"], ["teacher", "Teacher · Std 4"], ["teacher2", "Teacher · Std 5"], ["specialist", "Learning Studio"], ["admissions", "Admissions"], ["clerk", "Attendance clerk"], ["finance", "Finance"], ["moderator", "Portfolio moderator"], ["editor", "Content editor"], ["parent", "Parent (2 children)"], ["parent2", "Parent (Tan family)"], ["student", "Student"]];
const LOCAL_PREVIEW = import.meta.env.DEV && usingEmulators;

// "running" | "stopped" | "checking": whether the local test sign-in service answers.
function useLocalTestService() {
  const [state, setState] = useState(LOCAL_PREVIEW ? "checking" : "off");
  useEffect(() => {
    if (!LOCAL_PREVIEW) return undefined;
    let live = true;
    fetch(`http://${emulatorHost}:${import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099}/`, { mode: "no-cors" })
      .then(() => live && setState("running")).catch(() => live && setState("stopped"));
    return () => { live = false; };
  }, []);
  return state;
}

export function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const audience = audienceFromSearch(location.search);
  const localService = useLocalTestService();
  const [mode, setMode] = useState("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { auth.completeEmailLink(async () => window.prompt("Please confirm the email address this link was sent to.")).catch((reason) => setError(authErrorMessage(reason))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (auth.status === "signedIn") navigate(location.state?.from || "/hub", { replace: true }); }, [auth.status, navigate, location.state]);

  const run = async (action) => { setBusy(true); setError(""); setNotice(""); try { await action(); } catch (reason) { setError(authErrorMessage(reason)); } finally { setBusy(false); } };
  const change = (next) => { setMode(next); setError(""); setNotice(""); };

  return <div className="hub-signin">
    <header><Link to="/" reloadDocument>← Return to SRSS</Link><a href="/" className="hub-brand" aria-label="SRSS Digital Hub · go to the school homepage"><img src="/assets/srss-logo.png" alt="" /><strong>SRSS Digital Hub</strong></a></header>
    <main>
      <section aria-labelledby="signin-title">
        <p className="hub-kicker">{audience ? audience.kicker : "Sekolah Rendah Sathya Sai"}</p>
        <h1 id="signin-title">Sign in</h1>
        <p>{audience ? audience.intro : DEFAULT_SIGN_IN_INTRO}</p>
        {localService === "stopped" && <p className="hub-error" role="status">This is a local preview and its test sign-in service is not running, so signing in will not work here. Use the live site, or start the test service with <code>npm run emulators</code>.</p>}
        <div className="hub-signin-block">
          <button type="button" className="hub-button" disabled={busy} onClick={() => run(auth.signInWithGoogle)}>Continue with Google</button>
          <p className="hub-signin-or"><span>or</span></p>
          {mode === "link" && <form onSubmit={(event) => { event.preventDefault(); run(async () => { await auth.sendSignInLink(email); setNotice(`We sent a sign-in link to ${email}. Open it on this device. It can take a minute, and may land in spam.`); }); }}>
            <label>Your email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Email me a sign-in link</button>
            <p className="hub-signin-links"><button type="button" onClick={() => change("password")}>I have a password</button></p>
          </form>}
          {mode === "password" && <form onSubmit={(event) => { event.preventDefault(); run(() => auth.signInWithPassword(email, password)); }}>
            <label>Your email address<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Sign in</button>
            <p className="hub-signin-links"><button type="button" onClick={() => change("link")}>Email me a sign-in link instead</button><button type="button" onClick={() => change("reset")}>Forgot password?</button></p>
          </form>}
          {mode === "reset" && <form onSubmit={(event) => { event.preventDefault(); run(async () => { await auth.resetPassword(email); setNotice(`If ${email} has an account, a reset link is on its way.`); }); }}>
            <label>Your email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Send reset link</button>
            <p className="hub-signin-links"><button type="button" onClick={() => change("link")}>Back to sign in</button></p>
          </form>}
        </div>
        {notice && <p className="hub-status" role="status">{notice}</p>}
        {error && <p className="hub-error" role="alert">{error}</p>}
        <details className="hub-signin-help">
          <summary>Trouble signing in?</summary>
          <dl>{SIGN_IN_HELP.map(([question, answer, link]) => <div key={question}><dt>{question}</dt><dd>{answer}{link && <> <a href={link[1]}>{link[0]}</a></>}</dd></div>)}</dl>
          <p>School office: <a href={OFFICE_CONTACT.phoneHref}>{OFFICE_CONTACT.phone}</a> · <a href={`mailto:${OFFICE_CONTACT.email}`}>{OFFICE_CONTACT.email}</a></p>
        </details>
        <p className="hub-signin-legal">Use of the SRSS Digital Hub is covered by our <a href="/legal/terms">Terms of Use</a> and <a href="/legal/privacy">Privacy Policy</a>. Worried about a child? <a href="/legal/child-safeguarding#s-4">Safeguarding contacts</a>.</p>
        {localService === "running" && <details className="hub-demo"><summary>Developer test accounts (local preview only)</summary><div>{DEMO_ACCOUNTS.map(([key, label]) => <button key={key} type="button" disabled={busy} onClick={() => run(() => auth.signInWithPassword(`${key}@demo.srss.test`, DEMO_PASSWORD))}>{label}</button>)}</div></details>}
      </section>
    </main>
    <HubFooter />
  </div>;
}
