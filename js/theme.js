// ============================================================
// THEME — Dark (par défaut, ambiance du logo) / Light
// ============================================================

let currentTheme = localStorage.getItem("rak_theme") || "dark";

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  localStorage.setItem("rak_theme", currentTheme);
  applyThemeToDocument();
}

export function toggleTheme() {
  setTheme(currentTheme === "dark" ? "light" : "dark");
}

export function applyThemeToDocument() {
  if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#0d1526"); // le chrome reste sombre dans les deux thèmes
}
