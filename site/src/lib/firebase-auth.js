import { connectAuthEmulator, getAuth } from "firebase/auth";
import { app, emulatorHost, usingEmulators } from "./firebase";

export const auth = getAuth(app);

if (usingEmulators) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
}
