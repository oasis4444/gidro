# 🐒 Gidro — Apprendre les langues hors ligne

Gidro est une application d'apprentissage des langues ludique, inspirée de Duolingo, qui fonctionne **100 % hors ligne**.
Une fois la page ouverte une première fois, l'application est enregistrée sur l'appareil : leçons, voix, progression et profils restent en local, sans connexion.

*Gidro dia rindrambaiko fianarana fiteny mahafinaritra, mandeha tanteraka tsy misy Internet.*

## Fonctionnalités

| | |
|---|---|
| 📚 **Cours progressifs** | Anglais et espagnol (depuis le français), français (depuis le malgache). Unités classées Débutant, Intermédiaire et Avancé |
| 🧩 **9 types d'exercices** | Image, QCM, « comment dit-on », écoute, paires à associer, phrase à construire, traduction libre, texte à trou, dictée et prononciation |
| ✅ **Correction immédiate** | Bonne réponse, signification, notes de grammaire. Tolérance aux fautes de frappe et aux accents. Bouton « Ma réponse était correcte » |
| 💡 **Astuces** | Une explication de grammaire ou de conjugaison par leçon, avec la liste des mots à écouter |
| 🔊 **Audio hors ligne** | Synthèse vocale de l'appareil (vitesse réglable, mode lent 🐢) et effets sonores générés sans fichier |
| 🎤 **Reconnaissance vocale** | Optionnelle. Fonctionne hors ligne sur Chrome et Edge si le pack vocal de la langue est installé |
| 🎮 **Gamification** | XP, niveaux, séries de jours 🔥, gemmes 💎, 12 badges, 3 défis quotidiens, objectif du jour, combos, étoiles par leçon et confettis |
| 🧠 **Révisions intelligentes** | Répétition espacée (système de Leitner). Les éléments ratés reviennent plus vite. Page « points faibles » |
| 📊 **Suivi** | Statistiques, graphique des 7 derniers jours, historique, niveau par cours et test de niveau qui débloque les leçons |
| 👥 **Profils** | Plusieurs apprenants par appareil, chacun avec son avatar et sa progression |
| 💾 **Sauvegarde locale** | localStorage persistant, avec export et import d'un fichier JSON |
| 🌍 **Interface** | Français et malagasy, mode sombre automatique, ordinateur et mobile, installable comme application (PWA) |

## Structure

```
public/                 ← tout le site (aucune compilation nécessaire)
  index.html
  sw.js                 ← service worker : met tout en cache pour le hors ligne
  manifest.webmanifest  ← installation comme application
  css/app.css
  js/app.js             ← interface et déroulement des leçons
  js/engine.js          ← génération des exercices et correction
  js/store.js           ← profils, XP, séries, badges, défis, répétition espacée
  js/audio.js           ← voix, effets sonores, micro
  js/i18n.js            ← textes FR / MG
  js/mascot.js          ← Gidro le lémurien (SVG)
  data/courses.js       ← CONTENU DES COURS (à enrichir)
wrangler.jsonc          ← configuration Cloudflare
```

## Tester en local

```bash
cd public && python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer sur Cloudflare (depuis GitHub)

**Option A, recommandée (sans clé API) :**
1. Ouvrez dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository**.
2. Choisissez le dépôt GitHub `gidro`.
3. Laissez la commande de build vide. La commande de déploiement est `npx wrangler deploy` : elle lit `wrangler.jsonc`, qui publie le dossier `public/`.
   *(Avec Cloudflare **Pages**, indiquez simplement `public` comme « Build output directory ».)*
4. Ensuite, chaque `git push` sur `main` redéploie automatiquement.

**Option B, avec GitHub Actions :** ajoutez les secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID`, puis la variable `CF_DEPLOY_WITH_ACTIONS=true`. Le fichier `.github/workflows/deploy.yml` s'occupe du reste.

## Ajouter une leçon ou une langue

Tout se trouve dans `public/data/courses.js` :

```js
{ id: 'en-14', icon: '🏖️', title: 'Les vacances',
  tip: { title: '…', body: '…' },
  words: [['beach', 'plage', '🏖️'], …],                 // mot cible, traduction(s) « a|b », emoji
  sentences: [['I go to the beach.', 'Je vais à la plage.|Je vais à la mer.'], …] }
```

Après chaque modification, incrémentez `VERSION` dans `public/sw.js` pour que les appareils déjà installés récupèrent la mise à jour.

## Voix naturelles (Kokoro)

Les mots et les phrases sont prononcés par des **voix neuronales pré-enregistrées**, générées avec [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (modèle open source, licence Apache 2.0) :
anglais → `af_heart`, espagnol → `ef_dora`, français → `ff_siwis`.

- Le workflow `.github/workflows/voices.yml` se lance automatiquement à chaque modification de `public/data/courses.js`. Il génère les fichiers MP3 dans `public/audio/` et les ajoute au dépôt.
- L'application télécharge ces fichiers une seule fois, puis les lit **hors ligne**.
- Si un enregistrement manque, Gidro utilise la meilleure voix installée sur l'appareil (les voix « gadgets » sont ignorées). Vous pouvez aussi choisir la voix dans **Réglages › Voix**.
