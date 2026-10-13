import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onIdTokenChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { workspaceDomain } from "../lib/firebase";
import { auth } from "../lib/firebase-auth";
import { db } from "../lib/firebase-firestore";
import { ROLE_IDS, hubsFor, primaryHub } from "./permissions";

const AuthContext = createContext(null);
const EMAIL_KEY = "srss.hub.signInEmail";
const HUB_KEY = "srss.hub.activeHub";
const store = { get: (key) => { try { return localStorage.getItem(key); } catch { return null; } }, set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } }, remove: (key) => { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } } };

// Roles come only from custom claims set by the setUserRoles Cloud Function (AUTH-001).
// Scope (children, classes, audience keys) comes from users/{uid}, which only the server writes (AUTH-002).
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null, roles: [], claims: {}, scope: null });
  const [activeHub, setActiveHub] = useState(() => store.get(HUB_KEY));
  // Set on an explicit sign-out so the next person doesn't land on the previous user's last page.
  const userSignedOut = useRef(false);

  const loadScope = useCallback(async (user) => {
    try { const snap = await getDoc(doc(db, "users", user.uid)); return snap.exists() ? snap.data() : {}; } catch { return {}; }
  }, []);

  useEffect(() => onIdTokenChanged(auth, async (user) => {
    if (!user) return setState({ status: "signedOut", user: null, roles: [], claims: {}, scope: null });
    userSignedOut.current = false;
    const { claims } = await user.getIdTokenResult();
    const roles = (Array.isArray(claims.roles) ? claims.roles : []).filter((role) => ROLE_IDS.includes(role));
    const scope = roles.length ? await loadScope(user) : {};
    setState({ status: "signedIn", user, roles, claims, scope });
  }), [loadScope]);

  const hubs = hubsFor(state.roles);
  const currentHub = hubs.includes(activeHub) ? activeHub : primaryHub(state.roles);

  const value = useMemo(() => ({
    ...state,
    hubs,
    currentHub,
    // Role switcher (AUTH-001 AC3): defaults to the highest-privilege hub, remembers the user's choice.
    switchHub(hub) { setActiveHub(hub); store.set(HUB_KEY, hub); },
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      if (workspaceDomain) provider.setCustomParameters({ hd: workspaceDomain, prompt: "select_account" });
      return signInWithPopup(auth, provider);
    },
    signInWithPassword: (email, password) => signInWithEmailAndPassword(auth, email.trim(), password),
    resetPassword: (email) => sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/sign-in` }),
    async sendSignInLink(email) {
      await sendSignInLinkToEmail(auth, email.trim(), { url: `${window.location.origin}/sign-in`, handleCodeInApp: true });
      store.set(EMAIL_KEY, email.trim());
    },
    async completeEmailLink(promptForEmail) {
      if (!isSignInWithEmailLink(auth, window.location.href)) return false;
      const email = store.get(EMAIL_KEY) || (await promptForEmail());
      if (!email) return false;
      await signInWithEmailLink(auth, email, window.location.href);
      store.remove(EMAIL_KEY);
      return true;
    },
    async refresh() { await auth.currentUser?.getIdToken(true); },
    get userSignedOut() { return userSignedOut.current; },
    signOut: () => { userSignedOut.current = true; store.remove(HUB_KEY); setActiveHub(null); return firebaseSignOut(auth); },
  }), [state, hubs, currentHub]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}
