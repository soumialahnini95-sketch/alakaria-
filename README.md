# Al Akaria Transactions — version HTML/CSS autonome

Ce dossier contient un site statique sans React ni étape de compilation : HTML, CSS, JavaScript natif, données JSON et médias locaux. Les filtres, les fiches détaillées, le diaporama, le menu mobile et le formulaire WhatsApp fonctionnent sans backend. Les 14 photos et le logo sont fournis dans `assets/`; les chemins restent locaux au paquet.

## Ouvrir et modifier dans Visual Studio Code

1. Décompressez `al-akaria-html-css.zip` dans un dossier de votre choix.
2. Ouvrez ce dossier dans Visual Studio Code (`Fichier → Ouvrir le dossier`).
3. Lancez `python3 -m http.server 8000` dans ce dossier, puis visitez `http://localhost:8000`. L’extension Live Server de Visual Studio Code convient aussi.
4. Modifiez `styles.css` pour le design, `index.html` pour le contenu et `script.js` pour les interactions. Les 16 annonces et les coordonnées sont dans `data.js`.

## Héberger sur GitHub Pages

1. Créez un dépôt GitHub pour le site et téléversez **le contenu** de ce dossier à la racine du dépôt, notamment `index.html`, `styles.css`, `script.js`, `data.js`, `media-config.js` et `assets/`.
2. Dans GitHub, ouvrez `Settings → Pages`.
3. Dans **Build and deployment**, choisissez `Deploy from a branch`, sélectionnez `main` et le dossier `/(root)`, puis cliquez sur **Save**.
4. Après le déploiement, GitHub affichera l’adresse Pages dans cette même section.

Les chemins des médias sont relatifs au dossier : ils restent donc valides si le site est publié sous une adresse GitHub Pages de type `utilisateur.github.io/nom-du-depot/`.

## Images et provenance

Les photos filigranées Mubawab ne sont pas reprises. Chaque annonce dispose d’une photo locale d’ambiance choisie selon sa catégorie; les bureaux partagent certains visuels. Toutes les images de biens sont signalées « Illustration d’ambiance · non contractuelle » et ne prétendent pas représenter les logements ou locaux précis. Les trois fonds du diaporama sont également locaux. Le logo fourni est inclus dans `assets/logo.png`.

Les photos de stock proviennent de Pexels. Leur [licence officielle](https://www.pexels.com/license/) autorise l’utilisation gratuite sur un site sans obligation d’attribution. Les liens vers les annonces d’origine restent disponibles sur les fiches.

## Fonctionnement du formulaire

Le formulaire ne transmet rien à un serveur. Après validation, il ouvre WhatsApp avec un brouillon prérempli destiné au numéro public de l’agence; l’utilisateur vérifie puis envoie le message lui-même.
