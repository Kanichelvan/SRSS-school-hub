// Announcement delivery entry points kept for existing callers; SRSS Connect v2 lives in connect-model.js
// (rules of the domain) and connect-service.js (trusted workflows).
import { isLive, notificationFor, publicNotice, schoolDate } from "./connect-model.js";
import { ensureDelivery, syncPublicCopy } from "./connect-service.js";

export const malaysiaDate = schoolDate;
export const isLiveNotice = isLive;
export { notificationFor, publicNotice };

// Sync the public copy; when asked, run (or resume) the idempotent in-app delivery job for this notice.
export async function syncAnnouncement(db, id, { now = new Date(), stamp = () => new Date(), notify = true } = {}) {
  const notice = await syncPublicCopy(db, id, { now });
  if (!notify || !isLive(notice, now) || !notice.audienceKeys?.length) return { notified: 0 };
  const { notified } = await ensureDelivery(db, id, { now, stamp });
  return { notified };
}
