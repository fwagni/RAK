// ============================================================
// PAGE CLIENTS — liste, puis fiche détaillée avec l'historique
// complet du client : mesures, modèles/tissus, commandes.
// ============================================================
import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { listRecords, getRecord, ApiError } from "../api.js";
import { SCHEMAS } from "../schema.js";
import { openRecordForm, toast } from "../genericCrud.js";
import { navigate } from "../router.js";

const view = () => document.getElementById("view");

function errorMessage(err) {
  if (err instanceof ApiError && err.message === "NOT_CONFIGURED") return t("error_config");
  return t("error_generic");
}

export async function renderClientsPage() {
  const schema = SCHEMAS.clients;
  view().innerHTML = `
    <div class="page-title-bar">
      <h1>${t("clients_title")}</h1>
      <button class="btn btn-accent" data-action="add">${icons.plus} ${t("add")}</button>
    </div>
    <div class="search-bar">${icons.search}<input type="text" id="search-input" placeholder="${t("search_placeholder")}"></div>
    <div id="list-container"><div class="spinner"></div></div>
  `;

  view().querySelector('[data-action="add"]').addEventListener("click", () => {
    openRecordForm("clients", null, { onSaved: renderClientsPage });
  });

  let records = [];
  try { records = await listRecords("clients"); }
  catch (err) {
    view().querySelector("#list-container").innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${errorMessage(err)}</p></div>`;
    return;
  }

  function draw(list) {
    const container = view().querySelector("#list-container");
    if (!list.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🧵</div><h3>${t("clients_empty_title")}</h3><p>${t("clients_empty_text")}</p></div>`;
      return;
    }
    container.innerHTML = list.map((r) => {
      const name = r["Nom complet"] || "—";
      const initials = name.trim().slice(0, 2).toUpperCase();
      return `<div class="list-item" data-id="${r.id}">
        <div class="avatar">${initials}</div>
        <div class="item-main">
          <div class="item-title">${name}</div>
          <div class="item-sub">${r["Téléphone"] || r["Atelier"] || ""}</div>
        </div>
        <div class="item-trail">${icons.chevron}</div>
      </div>`;
    }).join("");
    container.querySelectorAll(".list-item").forEach((el) => {
      el.addEventListener("click", () => navigate(`/clients/${el.dataset.id}`));
    });
  }

  draw(records);
  view().querySelector("#search-input").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    draw(q ? records.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : records);
  });
}

export async function renderClientDetailPage({ id }) {
  view().innerHTML = `<div class="spinner"></div>`;
  let client;
  try { client = await getRecord("clients", id); }
  catch (err) { view().innerHTML = `<div class="empty-state"><p>${errorMessage(err)}</p></div>`; return; }

  view().innerHTML = `
    <div class="page-title-bar">
      <button class="btn-icon" id="back-btn">${icons.back}</button>
      <button class="btn-icon" id="edit-client-btn">${icons.edit}</button>
    </div>
    <h1>${client["Nom complet"] || "—"}</h1>
    <p class="subtitle">${[client["Téléphone"], client["Atelier"], client["Ville"]].filter(Boolean).join(" · ")}</p>
    ${client["Notes"] ? `<p style="margin-top:8px;color:var(--text-muted)">${client["Notes"]}</p>` : ""}

    <div class="divider"></div>

    <div class="section-heading">
      <h2>${t("client_measurements")}</h2>
      <button class="link" data-add="mesures">+ ${t("add_measurement")}</button>
    </div>
    <div id="mesures-list"><div class="spinner"></div></div>

    <div class="section-heading">
      <h2>${t("client_models")}</h2>
      <button class="link" data-add="modeles">+ ${t("add_model")}</button>
    </div>
    <div id="modeles-list"><div class="spinner"></div></div>

    <div class="section-heading">
      <h2>${t("client_orders")}</h2>
      <button class="link" data-add="commandes">+ ${t("add_order")}</button>
    </div>
    <div id="commandes-list"><div class="spinner"></div></div>
  `;

  view().querySelector("#back-btn").addEventListener("click", () => navigate("/clients"));
  view().querySelector("#edit-client-btn").addEventListener("click", () => {
    openRecordForm("clients", client, { onSaved: () => renderClientDetailPage({ id }) });
  });
  view().querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const entity = btn.dataset.add;
      openRecordForm(entity, null, { filterValue: id, onSaved: () => renderClientDetailPage({ id }) });
    });
  });

  loadSubList("mesures", id, "#mesures-list", (r) => `${r["Type de vêtement"] || t("mesures_title")} — ${r["Date de prise"] || ""}`);
  loadSubList("modeles", id, "#modeles-list", (r) => r["Nom du modèle"] || t("modeles_title"));
  loadSubList("commandes", id, "#commandes-list", (r) => `${r["Référence"] || ""} — ${r["Statut"] || ""}`, true);
}

async function loadSubList(entityKey, clientId, containerSelector, labelFn, isCommande) {
  const schema = SCHEMAS[entityKey];
  const container = view().querySelector(containerSelector);
  try {
    const records = await listRecords(entityKey, { filterProp: "Client", filterValue: clientId });
    if (!container) return;
    if (!records.length) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:var(--fs-small)">—</p>`;
      return;
    }
    container.innerHTML = records.map((r) => {
      let trail = "";
      if (isCommande && r["Statut"]) {
        const color = schema.statusColors[r["Statut"]] || "gray";
        trail = `<span class="badge badge-${color}">${r["Statut"]}</span>`;
      }
      return `<div class="list-item" data-id="${r.id}">
        <div class="item-main"><div class="item-title">${labelFn(r)}</div></div>
        <div class="item-trail">${trail}</div>
      </div>`;
    }).join("");
    container.querySelectorAll(".list-item").forEach((el) => {
      el.addEventListener("click", () => {
        const rec = records.find((r) => r.id === el.dataset.id);
        openRecordForm(entityKey, rec, { filterValue: clientId, onSaved: () => renderClientDetailPage({ id: clientId }) });
      });
    });
  } catch (err) {
    if (container) container.innerHTML = `<p style="color:var(--danger); font-size:var(--fs-small)">${errorMessage(err)}</p>`;
  }
}
