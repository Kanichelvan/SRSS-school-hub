import { parentHubSeed } from "../data/parentHubData";

const KEY = "srss.parent-hub.data.v1";
const clone = (value) => JSON.parse(JSON.stringify(value));

function localLoad() {
  try { return { ...clone(parentHubSeed), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return clone(parentHubSeed); }
}

function localSave(data) { localStorage.setItem(KEY, JSON.stringify(data)); return data; }

async function api(path, options) {
  const response = await fetch(`/api/parent-hub${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) throw new Error("Parent Hub service unavailable");
  return response.json();
}

export async function loadParentHubData() {
  try { return await api("/data"); } catch { return localLoad(); }
}

export async function saveParentHubData(data) {
  localSave(data);
  try { return await api("/data", { method: "PUT", body: JSON.stringify(data) }); } catch { return data; }
}

export async function signInParentHub({ email, password }) {
  try { return await api("/login", { method: "POST", body: JSON.stringify({ email, password }) }); }
  catch {
    if (password !== "srss2026") throw new Error("Use the demonstration password: srss2026");
    return { user: { name: email.startsWith("admin") ? "SRSS Administrator" : "Priya Raman", role: email.startsWith("admin") ? "admin" : "parent", email } };
  }
}
