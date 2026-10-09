// Firebase client for the secure hub. Loaded only on /sign-in and /hub routes so the public site
// bundle stays free of Firebase. With VITE_USE_EMULATORS=true (the default for local development)
// everything runs against the local emulator suite using the offline "demo-srss" project.
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const env = import.meta.env;
export const usingEmulators = env.VITE_USE_EMULATORS !== "false";

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "demo-srss.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "demo-srss",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "demo-srss.appspot.com",
  appId: env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Google Workspace domain for staff and student accounts (e.g. "srss.edu.my"). Parents sign in by email link.
export const workspaceDomain = env.VITE_WORKSPACE_DOMAIN || "";

export const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, env.VITE_FIREBASE_REGION || "asia-southeast1");

if (usingEmulators) {
  const host = env.VITE_EMULATOR_HOST || "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectStorageEmulator(storage, host, 9199);
  connectFunctionsEmulator(functions, host, 5001);
}
