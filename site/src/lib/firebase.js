// Shared Firebase app configuration for the secure hub. Individual service clients live in
// firebase-auth.js, firebase-firestore.js, firebase-functions.js and firebase-storage.js so
// route-level code splitting does not pull every Firebase SDK into the authenticated core.
import { initializeApp } from "firebase/app";

const env = import.meta.env;
export const usingEmulators = env.VITE_USE_EMULATORS !== "false";
export const emulatorHost = env.VITE_EMULATOR_HOST || "127.0.0.1";

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
export const firebaseRegion = env.VITE_FIREBASE_REGION || "asia-southeast1";
