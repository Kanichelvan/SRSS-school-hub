// Google Workspace file references — pure helpers shared by the WorkspaceActionModal and the rules-facing
// attachment shape. Free of Firebase and network calls so `npm test` covers them.
//
// The hub stores only a Drive file id and its canonical address. Who may open the file is decided by Google
// Drive sharing, never by the hub hiding a link, so private pupil documents must stay restricted in Drive.
// Creating a file opens Google's own editor (official "create" addresses); the teacher then attaches it.
// Browsing Drive with the Picker and creating files through the Drive API need per-user OAuth and arrive
// with the Workspace connection centre (Stage 5); this link flow remains the fallback when a connection is
// missing, expired or revoked.

export const WORKSPACE_KINDS = {
  document: { label: "Google Doc", service: "Docs", create: "https://docs.google.com/document/create" },
  spreadsheet: { label: "Google Sheet", service: "Sheets", create: "https://docs.google.com/spreadsheets/create" },
  presentation: { label: "Google Slides", service: "Slides", create: "https://docs.google.com/presentation/create" },
  form: { label: "Google Form", service: "Forms", create: "https://docs.google.com/forms/create" },
  file: { label: "Drive file", service: "Drive" },
  folder: { label: "Drive folder", service: "Drive" },
};

export const CREATABLE_KINDS = ["document", "spreadsheet", "presentation", "form"];
export const MAX_ATTACHMENTS = 20;

const ID = "([A-Za-z0-9_-]{10,})";
const PATTERNS = [
  ["docs.google.com", new RegExp(`^/document/(?:u/\\d+/)?d/${ID}`), "document"],
  ["docs.google.com", new RegExp(`^/spreadsheets/(?:u/\\d+/)?d/${ID}`), "spreadsheet"],
  ["docs.google.com", new RegExp(`^/presentation/(?:u/\\d+/)?d/${ID}`), "presentation"],
  ["docs.google.com", new RegExp(`^/forms/(?:u/\\d+/)?d/e/${ID}`), "form", true],
  ["docs.google.com", new RegExp(`^/forms/(?:u/\\d+/)?d/${ID}`), "form"],
  ["drive.google.com", new RegExp(`^/file/(?:u/\\d+/)?d/${ID}`), "file"],
  ["drive.google.com", new RegExp(`^/drive/(?:u/\\d+/)?folders/${ID}`), "folder"],
];

function canonicalUrl(kind, fileId, published, resourceKey) {
  const key = resourceKey ? `?resourcekey=${encodeURIComponent(resourceKey)}` : "";
  if (kind === "form") return published ? `https://docs.google.com/forms/d/e/${fileId}/viewform` : `https://docs.google.com/forms/d/${fileId}/edit`;
  if (kind === "file") return `https://drive.google.com/file/d/${fileId}/view${key}`;
  if (kind === "folder") return `https://drive.google.com/drive/folders/${fileId}${key}`;
  return `https://docs.google.com/${kind}/d/${fileId}/edit${key}`;
}

// Accepts a link copied from Drive, Docs, Sheets, Slides or Forms. Returns null for anything else,
// including look-alike hosts and non-HTTPS addresses.
export function parseGoogleUrl(raw) {
  let url;
  try { url = new URL(String(raw || "").trim()); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const resourceKey = url.searchParams.get("resourcekey") || null;
  if (url.hostname === "drive.google.com" && url.pathname === "/open" && /^[A-Za-z0-9_-]{10,}$/.test(url.searchParams.get("id") || "")) {
    const fileId = url.searchParams.get("id");
    return { kind: "file", fileId, published: false, url: canonicalUrl("file", fileId, false, resourceKey) };
  }
  for (const [host, pattern, kind, published = false] of PATTERNS) {
    if (url.hostname !== host) continue;
    const match = url.pathname.match(pattern);
    if (match) return { kind, fileId: match[1], published, url: canonicalUrl(kind, match[1], published, resourceKey) };
  }
  return null;
}

// The structured metadata the modal returns to the calling module and modules store on their record.
export function makeAttachment(parsed, { title, uid, now = new Date() } = {}) {
  if (!parsed?.fileId || !WORKSPACE_KINDS[parsed.kind]) throw new Error("Paste a link to a Google Drive, Docs, Sheets, Slides or Forms file.");
  const clean = String(title || "").trim().slice(0, 200);
  return { provider: "google", kind: parsed.kind, fileId: parsed.fileId, title: clean || WORKSPACE_KINDS[parsed.kind].label, url: parsed.url, addedBy: uid || null, addedAt: now.toISOString() };
}

// Adds an attachment unless the same file is already attached; enforces the per-record limit.
export function addAttachment(list, attachment) {
  const current = Array.isArray(list) ? list : [];
  if (current.some((item) => item.fileId === attachment.fileId)) return current;
  if (current.length >= MAX_ATTACHMENTS) throw new Error(`A record can hold up to ${MAX_ATTACHMENTS} attachments.`);
  return [...current, attachment];
}
