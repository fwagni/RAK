// ============================================================
// Pages qui n'ont besoin que de la liste + formulaire génériques
// ============================================================
import { renderListPage } from "../genericCrud.js";

export const renderCommandesPage = () => renderListPage("commandes");
export const renderFinancesPage = () => renderListPage("finances");
export const renderEmployesPage = () => renderListPage("employes");
export const renderAchatsPage = () => renderListPage("achats");
