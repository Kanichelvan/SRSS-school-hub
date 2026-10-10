import { HubFooter } from "./HubApp";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { authErrorMessage } from "../auth/authErrors";
import { usingEmulators } from "../lib/firebase";

// Emulator-only demo accounts created by scripts/seed-emulator.mjs (password defined there).
const DEMO_PASSWORD = "srss-demo-only";
const DEMO_ACCOUNTS = [["office", "Office admin"], ["principal", "Headmistress"], ["coordinator", "Academic coordinator"], ["teacher", "Class teacher"], ["specialist", "Learning Studio"], ["admissions", "Admissions"], ["finance", "Finance"], ["moderator", "Portfolio moderator"], ["editor", "Content editor"], ["parent", "Parent (2 children)"], ["student", "Student"]];

export function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { auth.completeEmailLink(async () => window.prompt("Please confirm the email address this link was sent to.")).catch((reason) => setError(authErrorMessage(reason))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (auth.status === "signedIn") navigate(location.state?.from || "/hub", { replace: true }); }, [auth.status, navigate, location.state]);

  const run = async (action) => { setBusy(true); setError(""); setNotice(""); try { await action(); } catch (reason) { setError(authErrorMessage(reason)); } finally { setBusy(false); } };

  return <div className="hub-signin">
    <header><Link to="/" reloadDocument>← Return to SRSS</Link><a href="/" className="hub-brand" aria-label="SRSS Digital Hub · go to the school homepage"><img src="/assets/srss-logo.png" alt="" /><strong>SRSS Digital Hub</strong></a></header>
    <main>
      <section aria-labelledby="signin-title">
        <p className="hub-kicker">Sekolah Rendah Sathya Sai</p>
        <h1 id="signin-title">Sign in</h1>
        <p>One front door for students, families, teachers and staff. You'll see only what your role allows.</p>
        <div className="hub-signin-block">
          <h2>Students, teachers and staff</h2>
          <button type="button" className="hub-button" disabled={busy} onClick={() => run(auth.signInWithGoogle)}>Continue with school Google account</button>
        </div>
        <div className="hub-signin-block">
          <h2>Parents and guardians</h2>
          {mode === "password" && <form onSubmit={(event) => { event.preventDefault(); run(() => auth.signInWithPassword(email, password)); }}>
            <label>Email address<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Sign in</button>
            <p className="hub-signin-links"><button type="button" onClick={() => setMode("link")}>Email me a sign-in link instead</button><button type="button" onClick={() => setMode("reset")}>Forgot password?</button></p>
          </form>}
          {mode === "link" && <form onSubmit={(event) => { event.preventDefault(); run(async () => { await auth.sendSignInLink(email); setNotice(`We sent a sign-in link to ${email}. Open it on this device.`); }); }}>
            <label>Email address registered with the school<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Email me a link</button>
            <p className="hub-signin-links"><button type="button" onClick={() => setMode("password")}>Use a password instead</button></p>
          </form>}
          {mode === "reset" && <form onSubmit={(event) => { event.preventDefault(); run(async () => { await auth.resetPassword(email); setNotice(`If ${email} has an account, a reset link is on its way.`); }); }}>
            <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <button type="submit" className="hub-button hub-button-quiet" disabled={busy}>Send reset link</button>
            <p className="hub-signin-links"><button type="button" onClick={() => setMode("password")}>Back to sign in</button></p>
          </form>}
        </div>
        {notice && <p className="hub-status" role="status">{notice}</p>}
        {error && <p className="hub-error" role="alert">{error}</p>}
        {usingEmulators && <details className="hub-demo"><summary>Local demo accounts (emulator only)</summary><div>{DEMO_ACCOUNTS.map(([key, label]) => <button key={key} type="button" disabled={busy} onClick={() => run(() => auth.signInWithPassword(`${key}@demo.srss.test`, DEMO_PASSWORD))}>{label}</button>)}</div></details>}
        <p className="hub-fineprint">Accounts are issued by the school office — there is no self-registration. Trouble signing in? Contact the office.</p>
      </section>
    </main>
    <HubFooter />
  </div>;
}
