// ============================================================
// PAGE ACCUEIL — indicateurs clés de l'atelier
// ============================================================
import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { getDashboardData, ApiError } from "../api.js";
import { navigate } from "../router.js";
import { renderMonthlyBarChart } from "../chart.js";

const view = () => document.getElementById("view");

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay());
  const end = new Date(start); end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}
function isThisMonth(dateStr, monthsAgo = 0) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const ref = new Date();
  ref.setMonth(ref.getMonth() - monthsAgo);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}
function isPast(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return d < today;
}
function whatsappUrl(phone, message) {
  const digits = (phone || "").replace(/[^\d+]/g, "").replace(/^00/, "+");
  return `https://wa.me/${digits.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

export async function renderDashboardPage() {
  view().innerHTML = `
    <div class="page-title-bar">
      <div><h1>${t("dash_title")}</h1><p class="subtitle">${t("dash_subtitle")}</p></div>
    </div>
    <div id="dash-content"><div class="spinner"></div></div>
  `;

  let clients = [], commandes = [], finances = [], achats = [];
  try {
    const data = await getDashboardData(); // une seule requête réseau
    clients = data.clients; commandes = data.commandes; finances = data.finances; achats = data.achats || [];
  } catch (err) {
    const msg = (err instanceof ApiError && err.message === "NOT_CONFIGURED") ? t("error_config") : t("error_generic");
    view().querySelector("#dash-content").innerHTML = `<div class="empty-state"><div class="empty-icon">🧵</div><p>${msg}</p></div>`;
    return;
  }

  const clientNameById = Object.fromEntries(clients.map((c) => [c.id, c["Nom complet"]]));
  const clientPhoneById = Object.fromEntries(clients.map((c) => [c.id, c["Téléphone"]]));

  const enCours = commandes.filter((c) => !["Livré", "Annulé"].includes(c["Statut"]));
  const overdue = enCours.filter((c) => isPast(c["Date de livraison prévue"]));
  const aLivrerSemaine = enCours.filter((c) => isThisWeek(c["Date de livraison prévue"]) && !isPast(c["Date de livraison prévue"]));
  const lowStock = achats.filter((a) => a["Stock bas"] === true);

  const soldeMois = finances.filter((f) => isThisMonth(f["Date"]))
    .reduce((sum, f) => sum + (f["Type"] === "Sortie" ? -Number(f["Montant (FCFA)"] || 0) : Number(f["Montant (FCFA)"] || 0)), 0);

  const upcoming = [...aLivrerSemaine].sort((a, b) => new Date(a["Date de livraison prévue"]) - new Date(b["Date de livraison prévue"]));
  const recentClients = [...clients].reverse().slice(0, 5);

  // Graphique : 6 derniers mois d'entrées/sorties
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString(undefined, { month: "short" });
    const income = finances.filter((f) => f["Type"] === "Entrée" && isThisMonth(f["Date"], i)).reduce((s, f) => s + Number(f["Montant (FCFA)"] || 0), 0);
    const expense = finances.filter((f) => f["Type"] === "Sortie" && isThisMonth(f["Date"], i)).reduce((s, f) => s + Number(f["Montant (FCFA)"] || 0), 0);
    months.push({ label, income, expense });
  }

  function reminderRow(c, isOverdue) {
    const clientId = (c["Client"] || [])[0];
    const name = clientNameById[clientId] || c["Référence"];
    const phone = clientPhoneById[clientId];
    const message = `Bonjour ${name || ""}, votre commande "${c["Référence"] || ""}" chez RAK est ${isOverdue ? "en retard" : "bientôt prête"}. Date prévue : ${c["Date de livraison prévue"] || ""}.`;
    return `
      <div class="list-item" data-id="${c.id}">
        <div class="avatar">${icons.calendar}</div>
        <div class="item-main reminder-row">
          <div>
            <div class="item-title">${name}</div>
            <div class="item-sub">${c["Date de livraison prévue"] || ""}</div>
          </div>
        </div>
        ${phone ? `<a class="whatsapp-link" href="${whatsappUrl(phone, message)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${icons.whatsapp}</a>` : ""}
      </div>`;
  }

  view().querySelector("#dash-content").innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${clients.length}</div><div class="stat-label">${t("dash_stat_clients")}</div></div>
      <div class="stat-card"><div class="stat-value">${enCours.length}</div><div class="stat-label">${t("dash_stat_en_cours")}</div></div>
      <div class="stat-card"><div class="stat-value">${aLivrerSemaine.length}</div><div class="stat-label">${t("dash_stat_a_livrer")}</div></div>
      <div class="stat-card accent"><div class="stat-value">${soldeMois.toLocaleString()} F</div><div class="stat-label">${t("dash_stat_solde_mois")}</div></div>
    </div>

    ${overdue.length ? `
      <div class="section-heading"><h2 style="color:var(--danger)">⚠️ ${t("dash_overdue")}</h2></div>
      <div>${overdue.map((c) => reminderRow(c, true)).join("")}</div>
    ` : ""}

    <div class="section-heading"><h2>${t("dash_upcoming")}</h2></div>
    <div id="upcoming-list">
      ${upcoming.length ? upcoming.map((c) => reminderRow(c, false)).join("") : `<p style="color:var(--text-muted); font-size:var(--fs-small)">—</p>`}
    </div>

    ${lowStock.length ? `
      <div class="section-heading"><h2>📦 ${t("dash_low_stock")}</h2><button class="link" id="see-achats">${t("dash_see_all")}</button></div>
      <div>
        ${lowStock.map((a) => `
          <div class="list-item">
            <div class="avatar">${icons.shopping}</div>
            <div class="item-main"><div class="item-title">${a["Article"] || "—"}</div><div class="item-sub">${a["Catégorie"] || ""}</div></div>
            <span class="badge badge-red">${t("badge_stock_bas")}</span>
          </div>`).join("")}
      </div>
    ` : ""}

    <div class="section-heading"><h2>${t("dash_revenue_chart")}</h2></div>
    <div class="card" style="margin-bottom:8px;">
      ${renderMonthlyBarChart(months, { incomeLabel: t("chart_income"), expenseLabel: t("chart_expense") })}
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
  view().querySelector("#see-achats")?.addEventListener("click", () => navigate("/achats"));
  view().querySelectorAll("#recent-clients .list-item, #upcoming-list .list-item, .reminder-row").forEach((el) => {
    const item = el.closest(".list-item");
    if (!item) return;
    item.addEventListener("click", () => {
      if (item.closest("#recent-clients")) navigate(`/clients/${item.dataset.id}`);
    });
  });
}
