# Prototypes Claude Design — références visuelles, NE PAS LIRE COMME SOURCE

Reçus le 2 octobre 2026. Même statut que les maquettes du dossier parent (`design/README.md`) :
ce sont des **prototypes cliquables à ouvrir dans un navigateur**, pas des sources.

- Leurs couleurs, rayons, ombres et tailles sont des valeurs web en dur. Aucune ne doit
  entrer dans un composant sans passer par `src/theme/theme.ts` (CLAUDE.md §3, règles 9 et 19).
- Leurs textes (microcopie, répliques du coach « Néo ») sont des **intentions de design**,
  pas des chaînes validées. Les répliques du coach ne sont **pas** un prompt
  (CLAUDE.md §9, « Coach IA »).
- Les décisions produit qu'ils supposent sont listées et ouvertes dans
  `DECISIONS-OUVERTES.md` §7. Rien n'est tranché du seul fait d'apparaître ici.

## Fichiers

| Fichier | Contenu |
| --- | --- |
| `Nurturia Phone Enfant.dc.html` | Mode enfant sur téléphone : accueil par activité, devoir (photo / écrit / dictée), évaluation, notion, coach, Mon parcours, Explorer, code parent. Bascule iPhone/Android, 360–430 pt, texte 100–200 %. |
| `Nurturia Phone Parent.dc.html` | Mode parent sur téléphone : connexion par code, Aujourd'hui, Erreurs, Signaux, Réglages (enfant, compte, confidentialité, notifications, accessibilité, aide). |
| `Nurturia Parent.dc.html` | Tableau de bord parent **web** (lecture seule), connexion web, écrans mobiles de consentement, consentement enfant. |
| `support.js` | Runtime Claude Design (généré). Nécessaire pour ouvrir les `.dc.html`. |

## Non archivé

- `Nurturia Enfant.dc.html` et `Nurturia Enfant v2.dc.html` — itérations précédentes,
  remplacées par `Nurturia Phone Enfant.dc.html` (qui les cite comme « version précédente »).
- `Nurturia Phone Parent.html` — export autonome du prototype parent téléphone, avec polices,
  React et une partie des illustrations embarquées en base64. Doublon de la source `.dc.html`.
- **Les illustrations de la mascotte** (`assets/nurtu-01-idle.svg` … `nurtu-09-bienveillance.svg`)
  n'ont pas été livrées : les images apparaissent cassées à l'ouverture. À récupérer dans le
  projet Claude Design et à déposer dans `design/prototypes/assets/`.

## Ouvrir

Les fichiers chargent React depuis unpkg : il faut une connexion. Servir le dossier en local
(par exemple `npx serve design/prototypes`) plutôt que l'ouvrir en `file://`, sans quoi
le chargement des fichiers voisins échoue.
