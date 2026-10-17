// One delivery per notice and recipient. Public copies deliberately exclude private links and scopes.
export const malaysiaDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const isLiveNotice = (notice, now = new Date()) => notice?.status === 'published' && (!notice.expiresAt || notice.expiresAt >= malaysiaDate(now));

export function publicNotice(id, notice, now = new Date()) {
  if (!isLiveNotice(notice, now) || notice.publicListing !== true || notice.audienceKeys?.length !== 1 || notice.audienceKeys[0] !== 'school') return null;
  const at = notice.publishedAt?.toDate?.() || notice.createdAt?.toDate?.() || now;
  return { sourceId: id, status: 'published', title: notice.title, body: notice.body || '', pinned: Boolean(notice.pinned), date: malaysiaDate(at), expiresAt: notice.expiresAt || null };
}

export function notificationFor(id, notice, recipientUid) {
  return { recipientUid, announcementId: id, category: 'announcement', critical: notice.category === 'urgent', title: notice.title, body: notice.body || '', link: '/hub/announcements', readAt: null };
}

export async function syncAnnouncement(db, id, { now = new Date(), stamp, notify = true } = {}) {
  const source = db.doc(`announcements/${id}`);
  const publicRef = db.doc(`publicAnnouncements/${id}`);
  const notice = await db.runTransaction(async tx => {
    const current = (await tx.get(source)).data();
    const publicCopy = current && publicNotice(id, current, now);
    if (publicCopy) tx.set(publicRef, publicCopy); else tx.delete(publicRef);
    return current;
  });
  if (!notify || !isLiveNotice(notice, now) || !notice.audienceKeys?.length) return { notified: 0 };
  const users = await db.collection('users').where('audienceKeys', 'array-contains-any', notice.audienceKeys.slice(0, 30)).get();
  const recipients = users.docs.filter(user => (user.data().status ?? 'active') === 'active' && user.data().roles?.length);
  let notified = 0;
  // Transactions read the latest publication and delivery receipts before creating a small batch.
  // A retry or concurrent trigger can never overwrite a read receipt or deliver the notice twice.
  for (let start = 0; start < recipients.length; start += 100) {
    const group = recipients.slice(start, start + 100);
    notified += await db.runTransaction(async tx => {
      const current = (await tx.get(source)).data();
      if (!isLiveNotice(current, now)) return 0;
      const eligible = group.filter(user => user.data().audienceKeys?.some(key => current.audienceKeys.includes(key)));
      if (!eligible.length) return 0;
      const refs = eligible.map(user => db.doc(`notificationRecords/announcement_${id}_${user.id}`));
      const existing = await tx.getAll(...refs);
      let count = 0;
      existing.forEach((snapshot, index) => {
        if (!snapshot.exists) { tx.create(refs[index], { ...notificationFor(id, current, eligible[index].id), createdAt: stamp() }); count++; }
      });
      return count;
    });
  }
  return { notified };
}
