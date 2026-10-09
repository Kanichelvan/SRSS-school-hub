// Website image library: resize in the browser, upload to Storage (media/public/**), register in
// Firestore `mediaRegistry`. Resizing keeps public pages fast (hero-size images stay well under the
// performance budget in docs/architecture.md) and strips camera metadata such as GPS location.
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export const MAX_EDGE = 2000;
const ACCEPTED = /^image\/(jpeg|png|webp)$/;

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export async function prepareImage(file, maxEdge = MAX_EDGE) {
  if (!ACCEPTED.test(file.type)) throw new Error("Choose a JPEG, PNG or WebP image.");
  if (file.size > 40 * 1024 * 1024) throw new Error("That file is over 40 MB. Export a smaller copy and try again.");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  // WebP where the browser can encode it; otherwise JPEG on a white background.
  let blob = await toBlob(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") {
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    blob = await toBlob(canvas, "image/jpeg", 0.85);
  }
  if (!blob) throw new Error("This image couldn't be processed. Try a different file.");
  return { blob, width, height, contentType: blob.type, extension: blob.type === "image/webp" ? "webp" : "jpg", originalName: file.name, originalBytes: file.size };
}

export async function uploadToLibrary({ prepared, alt, caption = "", containsPupils, consentChecked, uid }) {
  const record = doc(collection(db, "mediaRegistry"));
  const storagePath = `media/public/${record.id}.${prepared.extension}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, prepared.blob, { contentType: prepared.contentType, cacheControl: "public, max-age=31536000, immutable" });
  const url = await getDownloadURL(fileRef);
  const entry = {
    url, storagePath, alt: alt.trim(), caption: caption.trim(), containsPupils, consentChecked: containsPupils ? consentChecked : false,
    width: prepared.width, height: prepared.height, bytes: prepared.blob.size, contentType: prepared.contentType, originalName: prepared.originalName,
    classification: "public", status: "approved", uploadedBy: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: uid,
  };
  await setDoc(record, entry);
  return { id: record.id, ...entry };
}

export const formatBytes = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
