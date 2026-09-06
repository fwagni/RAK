// ============================================================
// PAGE PARAMÈTRES
// ============================================================
import { t, getLang, setLang } from "../i18n.js";
import { getTheme, setTheme } from "../theme.js";
import { applyLangToUI } from "../app.js";

const view = () => document.getElementById("view");

export function renderSettingsPage() {
  const lang = getLang();
  const theme = getTheme();

  view().innerHTML = `
    <div class="page-title-bar"><h1>${t("settings_title")}</h1></div>

    <div class="card" style="margin-bottom:16px;">
      <h3 style="margin-bottom:10px;">${t("settings_theme")}</h3>
      <div class="lang-toggle" style="background:var(--surface-muted); display:inline-flex;">
        <button data-theme-choice="dark" class="${theme === "dark" ? "active" : ""}" style="color:${theme === "dark" ? "" : "var(--text-muted)"}">${t("settings_theme_dark")}</button>
        <button data-theme-choice="light" class="${theme === "light" ? "active" : ""}" style="color:${theme === "light" ? "" : "var(--text-muted)"}">${t("settings_theme_light")}</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <h3 style="margin-bottom:10px;">${t("settings_language")}</h3>
      <div class="lang-toggle" style="background:var(--surface-muted); display:inline-flex;">
        <button data-lang="fr" class="${lang === "fr" ? "active" : ""}" style="color:${lang === "fr" ? "" : "var(--text-muted)"}">FR</button>
        <button data-lang="en" class="${lang === "en" ? "active" : ""}" style="color:${lang === "en" ? "" : "var(--text-muted)"}">EN</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <h3 style="margin-bottom:6px;">${t("field_atelier")}</h3>
      <p style="color:var(--text-muted); font-size:var(--fs-small)">${t("settings_ateliers")}</p>
    </div>

    <div class="card">
      <h3 style="margin-bottom:6px;">${t("settings_about")}</h3>
      <p style="color:var(--text-muted); font-size:var(--fs-small)">${t("settings_about_text")}</p>
    </div>
  `;

  view().querySelectorAll("[data-theme-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(btn.dataset.themeChoice);
      applyLangToUI(); // rafraîchit aussi l'icône soleil/lune du header/sidebar
      renderSettingsPage();
    });
  });

  view().querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      applyLangToUI();
      renderSettingsPage();
    });
  });
}
