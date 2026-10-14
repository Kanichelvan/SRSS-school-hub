// Later writes depend on server acknowledgement, even after the UI stops waiting.
export async function sendInOrder(commits, { online = true, timeoutMs = 8000 } = {}) {
  const sent = (async () => {
    for (const commit of commits) await commit();
  })();
  sent.catch(() => {});
  if (!online) return { queued: true, sent };
  let timer;
  try {
    const queued = await Promise.race([
      sent.then(() => false),
      new Promise((resolve) => { timer = setTimeout(() => resolve(true), timeoutMs); }),
    ]);
    return { queued, sent };
  } finally { clearTimeout(timer); }
}
