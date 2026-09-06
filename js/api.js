// ============================================================
// API — toutes les communications passent par le relais Apps
// Script (jamais directement vers Notion, à cause du CORS et
// pour ne jamais exposer la clé secrète Notion côté navigateur).
// ============================================================
import { APPS_SCRIPT_URL, DATA_SOURCES } from "./config.js";

class ApiError extends Error {}

function assertConfigured() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("COLLEZ_ICI")) {
    throw new ApiError("NOT_CONFIGURED");
  }
}

async function callGet(params) {
  assertConfigured();
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
  const res = await fetch(url.toString(), { method: "GET" });
  const json = await res.json();
  if (!json.ok) throw new ApiError(json.error || "REQUEST_FAILED");
  return json.data;
}

async function callPost(body) {
  assertConfigured();
  // Content-Type text/plain volontairement : évite le préflight CORS
  // qu'Apps Script ne gère pas bien avec application/json.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new ApiError(json.error || "REQUEST_FAILED");
  return json.data;
}

function dsId(entityKey) {
  const id = DATA_SOURCES[entityKey];
  if (!id) throw new ApiError("UNKNOWN_ENTITY");
  return id;
}

export async function listRecords(entityKey, { filterProp, filterValue } = {}) {
  return callGet({
    action: "list",
    dataSourceId: dsId(entityKey),
    filterProp: filterProp || "",
    filterValue: filterValue || "",
  });
}

export async function getRecord(entityKey, pageId) {
  return callGet({ action: "get", pageId });
}

export async function createRecord(entityKey, properties) {
  return callPost({ action: "create", dataSourceId: dsId(entityKey), properties });
}

export async function updateRecord(entityKey, pageId, properties) {
  return callPost({ action: "update", pageId, dataSourceId: dsId(entityKey), properties });
}

export async function deleteRecord(entityKey, pageId) {
  return callPost({ action: "delete", pageId });
}

// Upload d'une photo (base64, sans préfixe data:) puis renvoie une
// référence file_upload prête à attacher à une propriété "Files".
export async function uploadPhoto({ base64, filename, mimeType }) {
  return callPost({ action: "uploadPhoto", base64, filename, mimeType });
}

export { ApiError };
