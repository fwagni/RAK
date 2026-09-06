// ============================================================
// REÇU — génère une vue imprimable pour une commande, exportable
// en PDF via la fonction "Imprimer" native du téléphone/navigateur
// (Imprimer → Enregistrer en PDF). Aucune librairie externe requise.
// ============================================================
import { t } from "./i18n.js";
import { getRecord } from "./api.js";

export async function openReceiptView(commande) {
  const clientId = (commande["Client"] || [])[0];
  let client = null;
  if (clientId) {
    try { client = await getRecord("clients", clientId); } catch { /* tant pis, on imprime sans */ }
  }

  const total = Number(commande["Montant total (FCFA)"] || 0);
  const acompte = Number(commande["Acompte versé (FCFA)"] || 0);
  const solde = total - acompte;

  const rows = [
    [t("field_reference"), commande["Référence"] || "—"],
    [t("field_client"), client ? client["Nom complet"] : "—"],
  ];
  if (client && client["Téléphone"]) rows.push([t("field_telephone"), client["Téléphone"]]);
  rows.push([t("field_date_prise"), commande["Date de prise"] || "—"]);
  rows.push([t("field_date_livraison"), commande["Date de livraison prévue"] || "—"]);
  if (commande["Statut"]) rows.push([t("field_statut"), commande["Statut"]]);

  const wrapper = document.createElement("div");
  wrapper.id = "receipt-print-view";
  wrapper.innerHTML = `
    <div class="receipt">
      <div class="receipt-header">
        <img src="icons/logo-mark.png" alt="RAK">
        <div>
          <h2>RAK</h2>
          <p>${t("receipt_title")}</p>
        </div>
      </div>
      ${rows.map(([label, value]) => `<div class="receipt-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}
      <hr>
      <div class="receipt-row"><span>${t("field_montant_total")}</span><strong>${total.toLocaleString()} FCFA</strong></div>
      <div class="receipt-row"><span>${t("field_acompte")}</span><strong>${acompte.toLocaleString()} FCFA</strong></div>
      <div class="receipt-row receipt-total"><span>${t("field_solde")}</span><strong>${solde.toLocaleString()} FCFA</strong></div>
      <p class="receipt-footer">${t("receipt_thanks")}</p>
    </div>
  `;
  document.body.appendChild(wrapper);
  window.print();
  // Laisse le temps au dialogue d'impression de capturer le contenu
  // avant de le retirer du DOM.
  setTimeout(() => wrapper.remove(), 1000);
}
