// ============================================================
// PAGE ACCUEIL — indicateurs clés de l'atelier
// ============================================================
import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { listRecords, ApiError } from "../api.js";
import { navigate } from "../router.js";

const view = () => document.getElementById("view");

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay());
  const end = new Date(start); end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export async function renderDashboardPage() {
  view().innerHTML = `
    <div class="page-title-bar">
      <div><h1>${t("dash_title")}</h1><p class="subtitle">${t("dash_subtitle")}</p></div>
    </div>
    <div id="dash-content"><div class="spinner"></div></div>
  `;

  let clients = [], commandes = [], finances = [];
  try {
    [clients, commandes, finances] = await Promise.all([
      listRecords("clients"),
      listRecords("commandes"),
      listRecords("finances"),
    ]);
  } catch (err) {
    const msg = (err instanceof ApiError && err.message === "NOT_CONFIGURED") ? t("error_config") : t("error_generic");
    view().querySelector("#dash-content").innerHTML = `<div class="empty-state"><div class="empty-icon">🧵</div><p>${msg}</p></div>`;
    return;
  }

  const enCours = commandes.filter((c) => !["Livré", "Annulé"].includes(c["Statut"]));
  const aLivrerSemaine = commandes.filter((c) => isThisWeek(c["Date de livraison prévue"]) && c["Statut"] !== "Livré");
  const soldeMois = finances.filter((f) => isThisMonth(f["Date"]))
    .reduce((sum, f) => sum + (f["Type"] === "Sortie" ? -Number(f["Montant (FCFA)"] || 0) : Number(f["Montant (FCFA)"] || 0)), 0);

  const upcoming = [...aLivrerSemaine].sort((a, b) => new Date(a["Date de livraison prévue"]) - new Date(b["Date de livraison prévue"]));
  const recentClients = [...clients].reverse().slice(0, 5);

  const clientNameById = Object.fromEntries(clients.map((c) => [c.id, c["Nom complet"]]));

  view().querySelector("#dash-content").innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${clients.length}</div><div class="stat-label">${t("dash_stat_clients")}</div></div>
      <div class="stat-card"><div class="stat-value">${enCours.length}</div><div class="stat-label">${t("dash_stat_en_cours")}</div></div>
      <div class="stat-card"><div class="stat-value">${aLivrerSemaine.length}</div><div class="stat-label">${t("dash_stat_a_livrer")}</div></div>
      <div class="stat-card accent"><div class="stat-value">${soldeMois.toLocaleString()} F</div><div class="stat-label">${t("dash_stat_solde_mois")}</div></div>
    </div>

    <div class="section-heading"><h2>${t("dash_upcoming")}</h2></div>
    <div id="upcoming-list">
      ${upcoming.length ? upcoming.map((c) => `
        <div class="list-item" data-id="${c.id}">
          <div class="avatar">${icons.calendar}</div>
          <div class="item-main">
            <div class="item-title">${clientNameById[(c["Client"] || [])[0]] || c["Référence"]}</div>
            <div class="item-sub">${c["Date de livraison prévue"] || ""}</div>
          </div>
          <span class="badge badge-orange">${c["Statut"]}</span>
        </div>`).join("") : `<p style="color:var(--text-muted); font-size:var(--fs-small)">—</p>`}
    </div>

    <div class="section-heading">
      <h2>${t("dash_recent_clients")}</h2>
      <button class="link" id="see-all-clients">${t("dash_see_all")}</button>
    </div>
    <div id="recent-clients">
      ${recentClients.length ? recentClients.map((c) => `
        <div class="list-item" data-id="${c.id}">
          <div class="avatar">${(c["Nom complet"] || "?").slice(0, 2).toUpperCase()}</div>
          <div class="item-main">
            <div class="item-title">${c["Nom complet"] || "—"}</div>
            <div class="item-sub">${c["Téléphone"] || ""}</div>
          </div>
        </div>`).join("") : `<p style="color:var(--text-muted); font-size:var(--fs-small)">—</p>`}
    </div>
  `;

  view().querySelector("#see-all-clients")?.addEventListener("click", () => navigate("/clients"));
  view().querySelectorAll("#recent-clients .list-item, #upcoming-list .list-item").forEach((el) => {
    el.addEventListener("click", () => {
      if (el.closest("#recent-clients")) navigate(`/clients/${el.dataset.id}`);
    });
  });
}
