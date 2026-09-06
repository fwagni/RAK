// ============================================================
// GENERIC CRUD — construit une page liste + une fiche formulaire
// à partir d'une définition dans schema.js. Réutilisé par tous
// les modules simples (employés, achats, finances, mesures,
// modèles, commandes). Le module "clients" a sa propre page
// mais réutilise buildForm() et les mêmes composants.
// ============================================================
import { t, getLang } from "./i18n.js";
import { icons } from "./icons.js";
import { listRecords, createRecord, updateRecord, deleteRecord, uploadPhoto, ApiError } from "./api.js";
import { SCHEMAS } from "./schema.js";

const view = () => document.getElementById("view");
const sheetRoot = () => document.getElementById("sheet-root");

// ---------- Utilitaires UI ----------
export function toast(message) {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

export function closeSheet() {
  sheetRoot().innerHTML = "";
}

export function openSheet(innerHTML, { onMount } = {}) {
  sheetRoot().innerHTML = `
    <div class="sheet-overlay" data-close-overlay>
      <div class="sheet" role="dialog" aria-modal="true">
        <div class="sheet-handle"></div>
        ${innerHTML}
      </div>
    </div>`;
  sheetRoot().querySelector("[data-close-overlay]").addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close-overlay")) closeSheet();
  });
  if (onMount) onMount(sheetRoot());
}

class ValidationError extends Error {}

function errorMessage(err) {
  if (err instanceof ApiError && err.message === "NOT_CONFIGURED") return t("error_config");
  if (err instanceof ValidationError) return err.message;
  return t("error_generic");
}

function badgeColorFor(schema, value) {
  if (schema.statusColors && schema.statusColors[value]) return schema.statusColors[value];
  return "gray";
}

function formatValue(schema, field, value) {
  if (value == null || value === "") return "";
  if (field.type === "select") {
    const opt = field.options.find((o) => o.value === value);
    return opt ? t(opt.labelKey) : value;
  }
  return value;
}

// Traduit une valeur si elle correspond à une option d'un champ select
// du schéma (utile pour les sous-titres de liste : rôle, catégorie...).
function translateIfOption(schema, value) {
  if (!value) return "";
  for (const field of schema.fields) {
    if (field.type === "select") {
      const opt = field.options.find((o) => o.value === value);
      if (opt) return t(opt.labelKey);
    }
  }
  return value;
}

// ---------- Chargement des listes de relation (pour les <select>) ----------
// Un court cache mémoire évite de re-télécharger la liste des clients (par
// exemple) à chaque ouverture de formulaire — c'est ce qui causait la
// latence perçue à l'ouverture. Invalidé automatiquement après un
// enregistrement (voir invalidateRelationCache plus bas).
const relationCache = new Map(); // entityKey -> { data, ts }
const RELATION_CACHE_TTL = 45000;

export function invalidateRelationCache() {
  relationCache.clear();
}

async function loadRelationOptions(field) {
  const targetSchema = SCHEMAS[field.target];
  const cached = relationCache.get(field.target);
  let records;
  if (cached && (Date.now() - cached.ts) < RELATION_CACHE_TTL) {
    records = cached.data;
  } else {
    records = await listRecords(field.target);
    relationCache.set(field.target, { data: records, ts: Date.now() });
  }
  return records.map((r) => ({ id: r.id, label: r[targetSchema.titleProp] || "(sans titre)" }));
}

// ============================================================
// PAGE LISTE
// ============================================================
export async function renderListPage(entityKey, { filterProp, filterValue, headerExtra } = {}) {
  const schema = SCHEMAS[entityKey];
  view().innerHTML = `
    <div class="page-title-bar">
      <div>
        <h1>${t(schema.titleKey)}</h1>
      </div>
      <button class="btn btn-accent" data-action="add">${icons.plus} ${t("add")}</button>
    </div>
    ${headerExtra || ""}
    <div class="search-bar">
      ${icons.search}
      <input type="text" id="search-input" placeholder="${t("search_placeholder")}">
    </div>
    <div id="list-container"><div class="spinner"></div></div>
  `;

  view().querySelector('[data-action="add"]').addEventListener("click", () => openRecordForm(entityKey, null, { filterValue }));

  let allRecords = [];
  try {
    allRecords = await listRecords(entityKey, { filterProp, filterValue });
  } catch (err) {
    view().querySelector("#list-container").innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${errorMessage(err)}</p></div>`;
    return;
  }

  function renderList(records) {
    const container = view().querySelector("#list-container");
    if (!records.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧵</div>
          <h3>${t(schema.emptyTitleKey)}</h3>
          <p>${t(schema.emptyTextKey)}</p>
        </div>`;
      return;
    }
    container.innerHTML = records.map((r) => {
      const title = r[schema.titleProp] || "—";
      const sub = schema.subtitle ? schema.subtitle(r) : "";
      const initials = (title || "?").trim().slice(0, 2).toUpperCase();
      let trail = "";
      if (schema.statusField && r[schema.statusField]) {
        const label = formatValue(schema, { type: "select", options: schema.fields.find(f => f.name === schema.statusField).options }, r[schema.statusField]);
        trail = `<span class="badge badge-${badgeColorFor(schema, r[schema.statusField])}">${label}</span>`;
      } else if (r["Montant (FCFA)"] != null) {
        trail = `<span class="item-amount">${Number(r["Montant (FCFA)"]).toLocaleString()} F</span>`;
      }
      return `
        <div class="list-item" data-id="${r.id}">
          <div class="avatar">${initials}</div>
          <div class="item-main">
            <div class="item-title">${title}</div>
            <div class="item-sub">${translateIfOption(schema, sub)}</div>
          </div>
          <div class="item-trail">${trail}</div>
        </div>`;
    }).join("");
    container.querySelectorAll(".list-item").forEach((el) => {
      el.addEventListener("click", () => {
        const rec = records.find((r) => r.id === el.dataset.id);
        openRecordForm(entityKey, rec);
      });
    });
  }

  renderList(allRecords);

  view().querySelector("#search-input").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return renderList(allRecords);
    renderList(allRecords.filter((r) => JSON.stringify(r).toLowerCase().includes(q)));
  });
}

// ============================================================
// FORMULAIRE (fiche création / édition)
// ============================================================
export async function openRecordForm(entityKey, existing, { filterValue, onSaved, presetTitle } = {}) {
  const schema = SCHEMAS[entityKey];
  const isEdit = !!existing;
  const relationFields = schema.fields.filter((f) => f.type === "relation");

  // 1) La fiche s'ouvre TOUT DE SUITE, avec un indicateur de chargement si
  // des listes (client, modèle...) doivent encore être récupérées. Avant,
  // le code attendait en silence que TOUTES ces listes soient chargées,
  // une par une, avant même d'afficher quoi que ce soit : plusieurs
  // secondes sans aucun retour visuel pour la personne qui a tapé "Ajouter".
  openSheet(`
    <div class="sheet-header">
      <h2>${isEdit ? t("edit") : t("add")} — ${t(schema.titleKey)}</h2>
      <button class="btn-icon" data-close-overlay>${icons.close}</button>
    </div>
    <div id="sheet-body">${relationFields.length ? '<div class="spinner"></div>' : ""}</div>
  `, {
    onMount: (root) => {
      root.querySelector('[data-close-overlay]').addEventListener("click", closeSheet);
    }
  });

  // 2) Les listes de relation sont chargées EN PARALLÈLE (Promise.all)
  // plutôt que l'une après l'autre, et servies depuis le cache si elles
  // ont déjà été chargées il y a moins de 45 secondes.
  const relationFieldsData = {};
  try {
    const results = await Promise.all(relationFields.map((f) => loadRelationOptions(f)));
    relationFields.forEach((f, i) => { relationFieldsData[f.name] = results[i]; });
  } catch {
    relationFields.forEach((f) => { relationFieldsData[f.name] = []; });
  }

  // Si la personne a fermé la fiche pendant le chargement, on s'arrête là.
  const sheetBody = document.getElementById("sheet-body");
  if (!sheetBody) return;

  const fieldsHtml = schema.fields.map((field) => renderField(field, existing, relationFieldsData, filterValue)).join("");

  sheetBody.outerHTML = `
    <form id="record-form">
      ${fieldsHtml}
      <div class="sheet-actions">
        <button type="submit" class="btn btn-primary btn-block">${t("save")}</button>
      </div>
      ${isEdit ? `<button type="button" class="btn btn-danger btn-block" style="margin-top:8px" id="delete-btn">${icons.trash} ${t("delete")}</button>` : ""}
    </form>
  `;

  const root = sheetRoot();
  wirePhotoFields(root, schema);

  if (isEdit) {
    root.querySelector("#delete-btn").addEventListener("click", async () => {
      if (!confirm(t("delete_confirm"))) return;
      try {
        await deleteRecord(entityKey, existing.id);
        invalidateRelationCache();
        toast(t("deleted"));
        closeSheet();
        if (onSaved) onSaved();
      } catch (err) { toast(errorMessage(err)); }
    });
  }

  root.querySelector("#record-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = t("loading");
    try {
      const properties = await collectFormValues(root, schema, filterValue, existing);
      if (isEdit) {
        await updateRecord(entityKey, existing.id, properties);
      } else {
        await createRecord(entityKey, properties);
      }
      invalidateRelationCache();
      toast(t("saved"));
      closeSheet();
      if (onSaved) onSaved();
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
}

function renderField(field, existing, relationFieldsData, presetFilterValue) {
  const label = t(field.labelKey);
  const existingVal = existing ? existing[field.name] : undefined;

  if (field.type === "text" || field.type === "tel") {
    return `<div class="form-field"><label>${label}${field.required ? " *" : ""}</label>
      <input type="${field.type === "tel" ? "tel" : "text"}" name="${escAttr(field.name)}" value="${escAttr(existingVal || "")}">
    </div>`;
  }
  if (field.type === "textarea") {
    return `<div class="form-field"><label>${label}</label>
      <textarea name="${escAttr(field.name)}">${existingVal || ""}</textarea>
    </div>`;
  }
  if (field.type === "number") {
    return `<div class="form-field"><label>${label}${field.required ? " *" : ""}</label>
      <input type="number" step="any" name="${escAttr(field.name)}" value="${existingVal != null ? existingVal : ""}">
    </div>`;
  }
  if (field.type === "date") {
    return `<div class="form-field"><label>${label}</label>
      <input type="date" name="${escAttr(field.name)}" value="${existingVal || ""}">
    </div>`;
  }
  if (field.type === "select") {
    const opts = field.options.map((o) => `<option value="${escAttr(o.value)}" ${existingVal === o.value ? "selected" : ""}>${t(o.labelKey)}</option>`).join("");
    return `<div class="form-field"><label>${label}${field.required ? " *" : ""}</label>
      <select name="${escAttr(field.name)}"><option value="">—</option>${opts}</select>
    </div>`;
  }
  if (field.type === "relation") {
    const options = relationFieldsData[field.name] || [];
    const existingIds = Array.isArray(existingVal) ? existingVal : (existingVal ? [existingVal] : []);
    let preselect = existingIds[0] || "";
    if (!preselect && field.target === "clients" && presetFilterValue) preselect = presetFilterValue;
    const opts = options.map((o) => `<option value="${o.id}" ${preselect === o.id ? "selected" : ""}>${escHtml(o.label)}</option>`).join("");
    return `<div class="form-field"><label>${label}${field.required ? " *" : ""}</label>
      <select name="${escAttr(field.name)}" data-type="relation"><option value="">—</option>${opts}</select>
    </div>`;
  }
  if (field.type === "photo") {
    const existingFiles = Array.isArray(existingVal) ? existingVal : [];
    const previewUrl = existingFiles[0]?.url || "";
    return `<div class="form-field">
      <label>${label}</label>
      <div class="photo-field">
        <div class="photo-preview" data-preview>${previewUrl ? `<img src="${previewUrl}">` : icons.camera}</div>
        <div>
          <input type="file" accept="image/*" capture="environment" data-photo-input="${escAttr(field.name)}" class="visually-hidden" id="photo-${cssId(field.name)}">
          <label for="photo-${cssId(field.name)}" class="btn btn-ghost" style="cursor:pointer;">${t("take_photo")}</label>
        </div>
      </div>
    </div>`;
  }
  return "";
}

function wirePhotoFields(root, schema) {
  root.querySelectorAll("[data-photo-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const dataUrl = await resizeImageToDataUrl(file, 1280);
      const preview = input.closest(".photo-field").querySelector("[data-preview]");
      preview.innerHTML = `<img src="${dataUrl}">`;
      input.dataset.pendingDataUrl = dataUrl;
      input.dataset.pendingFilename = file.name || "photo.jpg";
    });
  });
}

// Redimensionne et compresse l'image côté navigateur avant envoi
// (limite la taille pour rester sous la limite Notion et accélérer l'upload).
function resizeImageToDataUrl(file, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function collectFormValues(root, schema, presetFilterValue, existing) {
  const form = root.querySelector("#record-form");
  const properties = {};

  for (const field of schema.fields) {
    if (field.type === "photo") continue; // traité séparément plus bas
    const input = form.elements[field.name];
    if (!input) continue;
    let value = input.value;
    if (field.required && !value) throw new ValidationError(`${t(field.labelKey)} : ${t("required_field")}`);

    if (field.type === "number") {
      properties[field.name] = value === "" ? null : Number(value);
    } else if (field.type === "relation") {
      properties[field.name] = value ? [value] : [];
    } else {
      properties[field.name] = value;
    }
  }

  // Auto-génération de la référence (mesures / commandes) si vide :
  // "<nom du client> - <date du jour>"
  const refField = schema.fields.find((f) => f.autoFrom === "client+date");
  if (refField && !properties[refField.name]) {
    const clientField = schema.fields.find((f) => f.type === "relation" && f.target === "clients");
    const today = new Date().toISOString().slice(0, 10);
    let clientLabel = "";
    if (clientField) {
      const select = form.elements[clientField.name];
      const selectedOption = select && select.selectedOptions[0];
      clientLabel = selectedOption && selectedOption.value ? selectedOption.textContent : "";
    }
    properties[refField.name] = clientLabel ? `${clientLabel} — ${today}` : `${schema.key}-${today}`;
  }

  // Photos : upload si une nouvelle photo a été choisie
  const photoInputs = root.querySelectorAll("[data-photo-input]");
  for (const input of photoInputs) {
    const fieldName = input.dataset.photoInput;
    if (input.dataset.pendingDataUrl) {
      const base64 = input.dataset.pendingDataUrl.split(",")[1];
      const uploaded = await uploadPhoto({ base64, filename: input.dataset.pendingFilename, mimeType: "image/jpeg" });
      properties[fieldName] = [{ fileUploadId: uploaded.fileUploadId }];
    }
  }

  return properties;
}

function escAttr(s) { return String(s).replace(/"/g, "&quot;"); }
function escHtml(s) { return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function cssId(s) { return String(s).replace(/[^a-z0-9]/gi, "-"); }
