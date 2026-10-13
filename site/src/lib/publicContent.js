// Public website ↔ Firestore without the Firebase SDK. Public pages read published CMS content and
// submit the enquiry/contact forms through the Firestore REST API, so the public bundle stays small
// (the SDK loads only on hub routes). Security rules decide what an anonymous visitor may read/write.
const env = import.meta.env;
const projectId = env.VITE_FIREBASE_PROJECT_ID || "demo-srss";
const apiKey = env.VITE_FIREBASE_API_KEY || "";
const usingEmulators = env.VITE_USE_EMULATORS !== "false";
const origin = usingEmulators ? `http://${env.VITE_EMULATOR_HOST || "127.0.0.1"}:8080` : "https://firestore.googleapis.com";
const database = `projects/${projectId}/databases/(default)`;
const base = `${origin}/v1/${database}/documents`;
const withKey = (url) => (apiKey && !usingEmulators ? `${url}${url.includes("?") ? "&" : "?"}key=${apiKey}` : url);

const decode = (value) => {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decode);
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  return null;
};
const decodeFields = (fields = {}) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decode(value)]));
const toRecord = (document) => ({ id: document.name.split("/").pop(), ...decodeFields(document.fields) });

const encode = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "object") return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
};
const encodeFields = (object) => Object.fromEntries(Object.entries(object).map(([key, value]) => [key, encode(value)]));

const equals = (field, value) => ({ fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: encode(value) } });

async function runQuery(collectionId, filters, limit = 50) {
  const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } };
  const response = await fetch(withKey(`${base}:runQuery`), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], where, limit } }) });
  if (!response.ok) throw new Error(`${collectionId}: ${response.status}`);
  return (await response.json()).filter((row) => row.document).map((row) => toRecord(row.document));
}

async function getPage(id) {
  const response = await fetch(withKey(`${base}/pages/${id}`));
  if (!response.ok) return null;
  const page = toRecord(await response.json());
  return page.status === "published" ? page.content || null : null;
}

// Published content for one editable website page (null until Leadership publishes it).
export async function loadSitePage(id) {
  if (typeof window !== "undefined" && window.__SRSS_EXPORTED_CONTENT__) return window.__SRSS_EXPORTED_CONTENT__.sitePages?.[id] || null;
  return getPage(id);
}

// Returns only the parts that loaded, so the caller keeps its built-in defaults for anything missing.
export async function loadPublicContent() {
  if (typeof window !== "undefined" && window.__SRSS_EXPORTED_CONTENT__) return window.__SRSS_EXPORTED_CONTENT__;
  const [news, events, homepage, about, faqs] = await Promise.allSettled([
    runQuery("newsPosts", [equals("status", "published")]),
    runQuery("events", [equals("status", "published"), equals("publicListing", true)], 100),
    getPage("homepage"),
    getPage("about"),
    getPage("faqs"),
  ]);
  const content = {};
  if (news.status === "fulfilled") content.news = news.value.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (events.status === "fulfilled") content.events = events.value.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (homepage.value) content.homepage = homepage.value;
  if (about.value) content.about = about.value;
  if (faqs.value?.items?.length) content.faqs = faqs.value.items;
  return content;
}

const trimmed = (fields) => Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]).filter(([, value]) => value !== ""));

// Creates one new document stamped with the server time; rules check the shape and that status is "new".
export async function submitPublicForm(collectionId, fields) {
  if (typeof window !== "undefined" && window.location.protocol === "file:") throw new Error("This downloaded copy is a read-only preview. Open the live SRSS site to send the form.");
  const id = crypto.randomUUID().replaceAll("-", "").slice(0, 20);
  const write = {
    update: { name: `${database}/documents/${collectionId}/${id}`, fields: encodeFields({ ...trimmed(fields), status: "new" }) },
    updateTransforms: [{ fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" }],
    currentDocument: { exists: false },
  };
  const response = await fetch(withKey(`${base}:commit`), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ writes: [write] }) });
  if (!response.ok) throw new Error("We couldn't send that just now. Please check the form and try again, or email the school office.");
}
