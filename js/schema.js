// ============================================================
// SCHEMA — décrit chaque base Notion : champs, types, options.
// Les valeurs des listes déroulantes (select) restent en français
// car ce sont les options exactes créées dans Notion ; seul le
// libellé affiché change selon la langue (labelKey).
// ============================================================

export const SCHEMAS = {

  clients: {
    key: "clients",
    titleKey: "clients_title",
    titleProp: "Nom complet",
    icon: "user",
    emptyTitleKey: "clients_empty_title",
    emptyTextKey: "clients_empty_text",
    subtitle: (r) => r["Téléphone"] || r["Atelier"] || "",
    fields: [
      { name: "Nom complet", type: "text", labelKey: "field_nom_complet", required: true },
      { name: "Téléphone", type: "tel", labelKey: "field_telephone" },
      { name: "Atelier", type: "text", labelKey: "field_atelier" },
      { name: "Ville", type: "text", labelKey: "field_ville" },
      { name: "Notes", type: "textarea", labelKey: "field_notes" },
    ],
  },

  employes: {
    key: "employes",
    titleKey: "employes_title",
    titleProp: "Nom",
    icon: "users",
    emptyTitleKey: "employes_empty_title",
    emptyTextKey: "employes_empty_text",
    subtitle: (r) => r["Rôle"] || "",
    statsQuery: {
      targetEntity: "commandes",
      filterProp: "Employé assigné",
      render: (commandes, t) => {
        const enCours = commandes.filter((c) => !["Livré", "Annulé"].includes(c["Statut"])).length;
        return `<div class="card" style="margin-bottom:16px; background:var(--surface-muted);">
          <div class="detail-grid" style="margin:0;">
            <div class="detail-item"><div class="label">${t("stats_commandes_assignees")}</div><div class="value">${commandes.length}</div></div>
            <div class="detail-item"><div class="label">${t("stats_commandes_en_cours")}</div><div class="value">${enCours}</div></div>
          </div>
        </div>`;
      },
    },
    fields: [
      { name: "Nom", type: "text", labelKey: "field_nom", required: true },
      { name: "Rôle", type: "select", labelKey: "field_role", options: [
        { value: "Styliste", labelKey: "role_styliste" },
        { value: "Couturier", labelKey: "role_couturier" },
        { value: "Couturière", labelKey: "role_couturiere" },
        { value: "Stagiaire", labelKey: "role_stagiaire" },
        { value: "Aide", labelKey: "role_aide" },
      ]},
      { name: "Atelier", type: "text", labelKey: "field_atelier" },
      { name: "Téléphone", type: "tel", labelKey: "field_telephone" },
      { name: "Statut", type: "select", labelKey: "field_statut_emp", options: [
        { value: "Actif", labelKey: "statut_actif" },
        { value: "Inactif", labelKey: "statut_inactif" },
      ]},
      { name: "Salaire/Prime (FCFA)", type: "number", labelKey: "field_salaire" },
    ],
  },

  modeles: {
    key: "modeles",
    titleKey: "modeles_title",
    titleProp: "Nom du modèle",
    icon: "image",
    emptyTitleKey: "modeles_title",
    emptyTextKey: "add_model",
    subtitle: (r) => r["Fournisseur tissu"] || "",
    fields: [
      { name: "Nom du modèle", type: "text", labelKey: "field_nom_modele", required: true },
      { name: "Client", type: "relation", target: "clients", labelKey: "field_client", required: true },
      { name: "Photo du modèle", type: "photo", labelKey: "field_photo_modele" },
      { name: "Photo du tissu", type: "photo", labelKey: "field_photo_tissu" },
      { name: "Quantité tissu (m)", type: "number", labelKey: "field_quantite_tissu" },
      { name: "Fournisseur tissu", type: "text", labelKey: "field_fournisseur_tissu" },
    ],
  },

  mesures: {
    key: "mesures",
    titleKey: "mesures_title",
    titleProp: "Référence",
    icon: "ruler",
    emptyTitleKey: "mesures_title",
    emptyTextKey: "add_measurement",
    subtitle: (r) => r["Type de vêtement"] || "",
    fields: [
      { name: "Référence", type: "text", labelKey: "field_reference", autoFrom: "client+date" },
      { name: "Client", type: "relation", target: "clients", labelKey: "field_client", required: true },
      { name: "Type de vêtement", type: "select", labelKey: "field_type_vetement", options: [
        { value: "Robe", labelKey: "vet_robe" }, { value: "Chemise", labelKey: "vet_chemise" },
        { value: "Pantalon", labelKey: "vet_pantalon" }, { value: "Costume", labelKey: "vet_costume" },
        { value: "Boubou", labelKey: "vet_boubou" }, { value: "Jupe", labelKey: "vet_jupe" },
        { value: "Autre", labelKey: "vet_autre" },
      ]},
      { name: "Poitrine (cm)", type: "number", labelKey: "field_poitrine", group: "mesures" },
      { name: "Taille (cm)", type: "number", labelKey: "field_taille", group: "mesures" },
      { name: "Bassin (cm)", type: "number", labelKey: "field_bassin", group: "mesures" },
      { name: "Longueur (cm)", type: "number", labelKey: "field_longueur", group: "mesures" },
      { name: "Épaule (cm)", type: "number", labelKey: "field_epaule", group: "mesures" },
      { name: "Manche (cm)", type: "number", labelKey: "field_manche", group: "mesures" },
      { name: "Tour de cou (cm)", type: "number", labelKey: "field_cou", group: "mesures" },
      { name: "Cuisse (cm)", type: "number", labelKey: "field_cuisse", group: "mesures" },
      { name: "Date de prise", type: "date", labelKey: "field_date_prise" },
      { name: "Notes", type: "textarea", labelKey: "field_notes" },
    ],
  },

  commandes: {
    key: "commandes",
    titleKey: "commandes_title",
    titleProp: "Référence",
    icon: "package",
    emptyTitleKey: "commandes_empty_title",
    emptyTextKey: "commandes_empty_text",
    subtitle: (r) => r["Date de livraison prévue"] || "",
    statusField: "Statut",
    statusColors: {
      "Pris": "gray", "En cours": "blue", "Essayage": "yellow",
      "Prêt": "orange", "Livré": "green", "Annulé": "red",
    },
    fields: [
      { name: "Référence", type: "text", labelKey: "field_reference", autoFrom: "client+date" },
      { name: "Client", type: "relation", target: "clients", labelKey: "field_client", required: true },
      { name: "Modèle", type: "relation", target: "modeles", labelKey: "field_modele", filterByClient: true },
      { name: "Statut", type: "select", labelKey: "field_statut", options: [
        { value: "Pris", labelKey: "statut_pris" }, { value: "En cours", labelKey: "statut_en_cours" },
        { value: "Essayage", labelKey: "statut_essayage" }, { value: "Prêt", labelKey: "statut_pret" },
        { value: "Livré", labelKey: "statut_livre" }, { value: "Annulé", labelKey: "statut_annule" },
      ]},
      { name: "Date de prise", type: "date", labelKey: "field_date_prise" },
      { name: "Date de livraison prévue", type: "date", labelKey: "field_date_livraison" },
      { name: "Montant total (FCFA)", type: "number", labelKey: "field_montant_total" },
      { name: "Acompte versé (FCFA)", type: "number", labelKey: "field_acompte" },
      { name: "Atelier", type: "text", labelKey: "field_atelier" },
      { name: "Employé assigné", type: "relation", target: "employes", labelKey: "field_employe_assigne" },
      { name: "Notes", type: "textarea", labelKey: "field_notes" },
    ],
  },

  finances: {
    key: "finances",
    titleKey: "finances_title",
    titleProp: "Libellé",
    icon: "coins",
    emptyTitleKey: "finances_empty_title",
    emptyTextKey: "finances_empty_text",
    subtitle: (r) => r["Catégorie"] || "",
    fields: [
      { name: "Libellé", type: "text", labelKey: "field_libelle", required: true },
      { name: "Type", type: "select", labelKey: "field_type", required: true, options: [
        { value: "Entrée", labelKey: "type_entree" }, { value: "Sortie", labelKey: "type_sortie" },
      ]},
      { name: "Catégorie", type: "select", labelKey: "field_categorie", options: [
        { value: "Vente", labelKey: "cat_vente" }, { value: "Achat tissu", labelKey: "cat_achat_tissu" },
        { value: "Salaire", labelKey: "cat_salaire" }, { value: "Loyer", labelKey: "cat_loyer" },
        { value: "Transport", labelKey: "cat_transport" }, { value: "Autre", labelKey: "cat_autre" },
      ]},
      { name: "Montant (FCFA)", type: "number", labelKey: "field_montant", required: true },
      { name: "Date", type: "date", labelKey: "field_date" },
      { name: "Atelier", type: "text", labelKey: "field_atelier" },
      { name: "Commande liée", type: "relation", target: "commandes", labelKey: "field_commande_liee" },
    ],
  },

  achats: {
    key: "achats",
    titleKey: "achats_title",
    titleProp: "Article",
    icon: "shopping",
    emptyTitleKey: "achats_empty_title",
    emptyTextKey: "achats_empty_text",
    subtitle: (r) => r["Catégorie"] || "",
    flagField: "Stock bas",
    fields: [
      { name: "Article", type: "text", labelKey: "field_article", required: true },
      { name: "Catégorie", type: "select", labelKey: "field_categorie_achat", options: [
        { value: "Tissu", labelKey: "cat_tissu" }, { value: "Fil", labelKey: "cat_fil" },
        { value: "Bouton", labelKey: "cat_bouton" }, { value: "Fermeture éclair", labelKey: "cat_fermeture" },
        { value: "Outillage", labelKey: "cat_outillage" }, { value: "Autre", labelKey: "cat_autre" },
      ]},
      { name: "Quantité", type: "number", labelKey: "field_quantite" },
      { name: "Unité", type: "select", labelKey: "field_unite", options: [
        { value: "Mètre", labelKey: "unite_metre" }, { value: "Pièce", labelKey: "unite_piece" },
        { value: "Rouleau", labelKey: "unite_rouleau" }, { value: "Kg", labelKey: "unite_kg" },
        { value: "Litre", labelKey: "unite_litre" },
      ]},
      { name: "Prix unitaire (FCFA)", type: "number", labelKey: "field_prix_unitaire" },
      { name: "Fournisseur", type: "text", labelKey: "field_fournisseur" },
      { name: "Date d'achat", type: "date", labelKey: "field_date_achat" },
      { name: "Atelier", type: "text", labelKey: "field_atelier" },
      { name: "Stock bas", type: "checkbox", labelKey: "field_stock_bas", optional: true },
    ],
  },
};
