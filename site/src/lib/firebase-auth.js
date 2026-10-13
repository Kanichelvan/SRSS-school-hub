import { connectAuthEmulator, getAuth } from "firebase/auth";
import { app, emulatorHost, usingEmulators } from "./firebase";

export const auth = getAuth(app);

if (usingEmulators) {
  connectAuthEmulator(auth, `http://${emulatorHost}:${import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099}`, { disableWarnings: true });
}
