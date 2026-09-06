// ============================================================
// APP — assemble navigation, routes et démarre l'application
// ============================================================
import { t, getLang, setLang } from "./i18n.js";
import { getTheme, setTheme, toggleTheme, applyThemeToDocument } from "./theme.js";
import { icons } from "./icons.js";
import { registerRoute, startRouter, navigate, getCurrentPath } from "./router.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderClientsPage, renderClientDetailPage } from "./pages/clients.js";
import { renderCommandesPage, renderFinancesPage, renderEmployesPage, renderAchatsPage } from "./pages/simplePages.js";
import { renderMorePage } from "./pages/more.js";
import { renderSettingsPage } from "./pages/settings.js";

const NAV_ITEMS = [
  { path: "/",           icon: "home",     labelKey: "nav_dashboard", inBottomNav: true },
  { path: "/clients",    icon: "user",     labelKey: "nav_clients",   inBottomNav: true },
  { path: "/commandes",  icon: "package",  labelKey: "nav_commandes", inBottomNav: true },
  { path: "/finances",   icon: "coins",    labelKey: "nav_finances",  inBottomNav: true },
  { path: "/employes",   icon: "users",    labelKey: "nav_employes",  inBottomNav: false },
  { path: "/achats",     icon: "shopping", labelKey: "nav_achats",    inBottomNav: false },
  { path: "/parametres", icon: "settings", labelKey: "nav_settings",  inBottomNav: false },
];

function renderNav() {
  // Sidebar (desktop) : tous les liens
  document.getElementById("sidebar-nav").innerHTML = NAV_ITEMS.map((item) => `
    <a href="#${item.path}" data-path="${item.path}">${icons[item.icon]}<span>${t(item.labelKey)}</span></a>
  `).join("");

  // Bottom nav (mobile) : 4 liens + "Plus"
  const bottomItems = NAV_ITEMS.filter((i) => i.inBottomNav);
  document.getElementById("bottom-nav").innerHTML =
    bottomItems.map((item) => `
      <a href="#${item.path}" data-path="${item.path}">
        <span class="nav-icon-wrap">${icons[item.icon]}</span>
        <span>${t(item.labelKey)}</span>
      </a>`).join("") +
    `<a href="#/plus" data-path="/plus">
        <span class="nav-icon-wrap">${icons.more}</span>
        <span>${t("nav_more")}</span>
      </a>`;

  updateActiveNav();
}

function updateActiveNav() {
  const path = getCurrentPath();
  const isMoreSection = ["/employes", "/achats", "/parametres", "/plus"].includes(path);

  document.querySelectorAll(".sidebar nav a, .bottom-nav a").forEach((a) => {
    const p = a.dataset.path;
    const isActive = p === path || (p === "/clients" && path.startsWith("/clients/"));
    a.classList.toggle("active", isActive);
  });

  // Sur mobile, l'onglet "Plus" reste actif pour toutes les pages de son sous-menu
  if (isMoreSection) {
    document.querySelectorAll('.bottom-nav a[data-path="/plus"]').forEach((a) => a.classList.add("active"));
  }
}

function renderLangToggle() {
  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === getLang());
      btn.onclick = () => { setLang(btn.dataset.lang); applyLangToUI(); };
    });
  });
}

function renderThemeToggle() {
  document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
    btn.innerHTML = getTheme() === "dark" ? icons.sun : icons.moon;
    btn.setAttribute("aria-label", getTheme() === "dark" ? t("settings_theme_light") : t("settings_theme_dark"));
    btn.onclick = () => { toggleTheme(); renderThemeToggle(); };
  });
}

export function applyLangToUI() {
  renderNav();
  renderLangToggle();
  renderThemeToggle();
  // Recharge la page courante pour retraduire son contenu
  window.dispatchEvent(new Event("hashchange"));
}

function registerRoutes() {
  registerRoute("/", renderDashboardPage);
  registerRoute("/clients", renderClientsPage);
  registerRoute("/clients/:id", renderClientDetailPage);
  registerRoute("/commandes", renderCommandesPage);
  registerRoute("/finances", renderFinancesPage);
  registerRoute("/employes", renderEmployesPage);
  registerRoute("/achats", renderAchatsPage);
  registerRoute("/parametres", renderSettingsPage);
  registerRoute("/plus", renderMorePage);
}

function init() {
  document.documentElement.lang = getLang();
  applyThemeToDocument();
  renderNav();
  renderLangToggle();
  renderThemeToggle();
  registerRoutes();
  startRouter();
  document.addEventListener("route:changed", updateActiveNav);
}

init();
