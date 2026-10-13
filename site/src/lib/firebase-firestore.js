import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { app, emulatorHost, usingEmulators } from "./firebase";

export const db = getFirestore(app);

if (usingEmulators) {
  connectFirestoreEmulator(db, emulatorHost, 8080);
}
