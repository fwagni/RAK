// ============================================================
// PAGE "PLUS" — menu secondaire (mobile) vers Employés, Achats,
// Paramètres. Sur desktop ces liens sont déjà dans la sidebar.
// ============================================================
import { t } from "../i18n.js";
import { icons } from "../icons.js";
import { navigate } from "../router.js";

const view = () => document.getElementById("view");

const items = [
  { path: "/employes", icon: "users", labelKey: "nav_employes" },
  { path: "/achats", icon: "shopping", labelKey: "nav_achats" },
  { path: "/parametres", icon: "settings", labelKey: "nav_settings" },
];

export function renderMorePage() {
  view().innerHTML = `
    <div class="page-title-bar"><h1>${t("nav_more")}</h1></div>
    <div id="more-list">
      ${items.map((it) => `
        <div class="list-item" data-path="${it.path}">
          <div class="avatar">${icons[it.icon]}</div>
          <div class="item-main"><div class="item-title">${t(it.labelKey)}</div></div>
          <div class="item-trail">${icons.chevron}</div>
        </div>`).join("")}
    </div>
  `;
  view().querySelectorAll(".list-item").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.path));
  });
}
