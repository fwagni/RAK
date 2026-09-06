// ============================================================
// CONFIGURATION — le seul fichier à modifier après déploiement
// ============================================================
//
// 1) Déployez le relais Google Apps Script (voir apps-script/Code.gs
//    et le README) puis collez ici l'URL de déploiement obtenue
//    (elle ressemble à : https://script.google.com/macros/s/XXXX/exec)
//
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpczWm1iaVLVRFkHq7H6cpukx1ZtlG0ezJ1o13d6Tx9-DWytoGeEUdWS-Tsi9TBjPz/exec";

// 2) Ne changez rien ci-dessous : ce sont les identifiants des bases
//    Notion déjà créées dans l'espace "Mon Atelier — Gestion".
export const DATA_SOURCES = {
  clients:  "041d92ff-11da-4780-8556-621884847de5",
  employes: "2d73ecd1-c128-41f8-a0ad-d4f958297f47",
  modeles:  "197792d5-b807-41c9-87f9-e9171204f85b",
  mesures:  "fc45205c-a8fd-494d-998f-236bc888014c",
  commandes:"f7f9ef3d-9ee2-47c0-984b-71e5156ec136",
  finances: "bd11c40f-aa96-4f6f-a10d-e0188e437f23",
  achats:   "01ab5f6d-5b6f-4c91-881d-443b559d461d",
};

export const APP_NAME = "RAK";
