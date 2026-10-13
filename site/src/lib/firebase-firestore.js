import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { app, emulatorHost, usingEmulators } from "./firebase";

export const db = getFirestore(app);

if (usingEmulators) {
  connectFirestoreEmulator(db, emulatorHost, Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || 8080));
}
