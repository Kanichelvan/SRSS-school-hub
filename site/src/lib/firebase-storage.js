import { connectStorageEmulator, getStorage } from "firebase/storage";
import { app, emulatorHost, usingEmulators } from "./firebase";

export const storage = getStorage(app);

if (usingEmulators) {
  connectStorageEmulator(storage, emulatorHost, Number(import.meta.env.VITE_STORAGE_EMULATOR_PORT || 9199));
}
