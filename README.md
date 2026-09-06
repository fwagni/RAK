# RAK — Guide d'installation (10-15 minutes, 100% gratuit)

Votre espace Notion est déjà prêt : la page **"Mon Atelier — Gestion"** contient
les 7 bases de données (Clients, Employés, Modèles & Tissus, Mesures,
Commandes, Finances, Achats & Stock), déjà reliées entre elles.

👉 Lien de votre espace : https://app.notion.com/p/3d30b7e355338119be76e160b539bb2e

Il reste 3 étapes pour que l'application (le site) puisse lire et écrire dedans.

---

## Étape 1 — Créer une intégration Notion (2 min)

1. Allez sur https://www.notion.so/my-integrations
2. Cliquez **"New integration"**
3. Donnez-lui un nom, par exemple `Atelier App`, choisissez votre espace de travail
4. Cliquez **"Submit"**, puis copiez le **"Internal Integration Secret"**
   (il commence par `ntn_...` ou `secret_...`) — gardez-le, il sert à l'étape 2.
5. Retournez sur la page **"Mon Atelier — Gestion"** dans Notion, cliquez sur
   **"..."** en haut à droite → **"Connexions"** (ou "Connections") →
   cherchez `Atelier App` et ajoutez-la. Cela donne accès à la page **et à
   toutes les bases qu'elle contient**.

⚠️ Ce secret donne accès à votre espace Notion. Ne le partagez jamais, ne le
mettez jamais dans le code du site (il ne va que dans Apps Script, étape 2).

---

## Étape 2 — Déployer le relais Google Apps Script (5 min)

C'est un petit programme gratuit qui fait le lien sécurisé entre le site et Notion.

1. Allez sur https://script.google.com et connectez-vous avec un compte Gmail
2. Cliquez **"Nouveau projet"**
3. Supprimez le contenu par défaut, puis copiez-collez tout le contenu du
   fichier `apps-script/Code.gs` fourni ici
4. Cliquez sur l'icône ⚙️ **"Paramètres du projet"** (dans le menu de gauche)
5. Descendez à **"Propriétés du script"** → **"Ajouter une propriété du script"**
   - Nom : `NOTION_SECRET`
   - Valeur : collez le secret copié à l'étape 1
6. Retournez dans l'éditeur (icône `< >`), cliquez **"Déployer"** →
   **"Nouveau déploiement"**
7. Cliquez sur l'icône ⚙️ à côté de "Sélectionner le type" → **"Application Web"**
8. Réglages :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
9. Cliquez **"Déployer"**, autorisez les permissions demandées (c'est votre
   propre script, Google demande juste une confirmation)
10. Copiez l'**URL de l'application Web** obtenue (elle ressemble à
    `https://script.google.com/macros/s/AKfycb.../exec`)

---

## Étape 3 — Connecter le site à votre relais (1 min)

1. Ouvrez le fichier `js/config.js`
2. Remplacez `"COLLEZ_ICI_VOTRE_URL_APPS_SCRIPT"` par l'URL copiée à l'étape 2
3. Enregistrez

---

## Étape 4 — Mettre le site en ligne sur GitHub Pages (3 min)

1. Sur https://github.com, créez un nouveau dépôt (Repository), par exemple
   `atelier-app` — cochez **"Public"** (nécessaire pour GitHub Pages gratuit)
2. Cliquez **"uploading an existing file"** (ou glissez tout le contenu du
   dossier `atelier-app/` — sauf le dossier `apps-script/`, qui ne doit
   **pas** être mis sur GitHub car il n'a rien à y faire, uniquement dans
   Google Apps Script) directement dans la page du dépôt
3. Cliquez **"Commit changes"**
4. Allez dans **Settings** (du dépôt) → **Pages**
5. Sous "Branch", sélectionnez `main` et `/ (root)`, cliquez **"Save"**
6. Après 1-2 minutes, votre site est accessible à une adresse du type :
   `https://votre-nom-utilisateur.github.io/atelier-app/`

Ouvrez cette adresse sur le téléphone, puis :
- **Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil"
- **iPhone (Safari)** : bouton Partager → "Sur l'écran d'accueil"

L'application s'installe comme une vraie appli, avec son icône.

---

## Vérification (checklist)

- [ ] J'ai partagé la page Notion avec mon intégration
- [ ] `NOTION_SECRET` est bien enregistré dans les propriétés du script Apps Script
- [ ] Le déploiement Apps Script est en accès "Tout le monde"
- [ ] `js/config.js` contient bien l'URL `.../exec` (pas l'URL de l'éditeur)
- [ ] Le site s'ouvre et le tableau de bord affiche "0" partout (pas de message d'erreur)
- [ ] Créer un client fonctionne, et il apparaît bien dans Notion

---

## Résolution de problèmes

**"L'application n'est pas encore connectée à Notion"**
→ `js/config.js` contient encore le texte par défaut. Complétez l'étape 3.

**Rien ne s'affiche / erreur générique**
→ Vérifiez que la page Notion est bien partagée avec l'intégration (étape 1.5)
→ Vérifiez le `NOTION_SECRET` dans Apps Script (espaces en trop, guillemets...)
→ Dans Apps Script, menu **"Exécutions"** (icône horloge) : les erreurs
  détaillées de chaque appel y sont visibles.

**L'envoi de photo échoue**
→ Vérifiez que le fichier fait moins de ~5 Mo (l'app compresse déjà les
  photos automatiquement, mais une photo très grande peut parfois dépasser
  la limite du réseau mobile). Réessayez avec une meilleure connexion.

**Je veux ajouter un nouvel atelier / une nouvelle option**
→ Ouvrez directement la base concernée dans Notion et ajoutez l'option dans
  la colonne "Atelier" (ou toute autre liste déroulante). Aucune modification
  du code n'est nécessaire.

---

## Ce qui est inclus aujourd'hui

- Tableau de bord (clients, commandes en cours, livraisons de la semaine, solde du mois)
- Clients (fiche + historique complet : mesures, modèles/tissus, commandes)
- Mesures avec champs standards du métier + notes libres
- Modèles & tissus avec photos (modèle et tissu)
- Commandes avec statut, dates, acompte/solde automatique
- Finances (entrées/sorties, catégorisées, liées aux commandes)
- Employés & stagiaires
- Achats & stock
- Français / Anglais, bascule instantanée
- Utilisable sur téléphone (installable) et grand écran

## Pistes pour plus tard (non incluses aujourd'hui)

- Mode hors-ligne avec synchronisation différée
- Rôles fins par atelier ou par employé (aujourd'hui : tout le monde qui a
  l'URL du site a accès à tout — gardez le lien du site privé au sein de
  l'équipe)
- Génération de factures PDF
- Rappels automatiques de livraison par SMS/WhatsApp
