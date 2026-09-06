// ============================================================
// ROUTER — routage simple par hash (#/clients, #/clients/ID, ...)
// Pas de dépendance externe : fonctionne tel quel sur GitHub Pages.
// ============================================================

const routes = [];

export function registerRoute(pattern, handler) {
  // pattern ex: "/clients/:id" -> regex avec groupes nommés
  const paramNames = [];
  const regexStr = "^" + pattern.replace(/:[^/]+/g, (m) => {
    paramNames.push(m.slice(1));
    return "([^/]+)";
  }) + "$";
  routes.push({ regex: new RegExp(regexStr), paramNames, handler });
}

export function navigate(path) {
  window.location.hash = path;
}

function currentPath() {
  const hash = window.location.hash || "#/";
  return hash.slice(1) || "/";
}

async function resolve() {
  const path = currentPath();
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      await route.handler(params);
      document.dispatchEvent(new CustomEvent("route:changed", { detail: { path } }));
      return;
    }
  }
  console.warn("Aucune route ne correspond à", path);
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}

export function getCurrentPath() {
  return currentPath();
}
