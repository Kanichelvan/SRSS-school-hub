import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { app, emulatorHost, firebaseRegion, usingEmulators } from "./firebase";

export const functions = getFunctions(app, firebaseRegion);

if (usingEmulators) {
  connectFunctionsEmulator(functions, emulatorHost, 5001);
}
