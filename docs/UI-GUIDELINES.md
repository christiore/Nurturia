# Nurtura — Guidelines UI/UX mobile

**Version 0.1 (brouillon de travail) · 13 août 2026 · Cible : React Native / Expo**

Ce document et le styleguide HTML qui l'accompagne définissent le langage visuel et les
règles d'interaction des deux applications avant le passage à Claude Design et au premier
développement. Ce sont des **guidelines de système**, pas des maquettes définitives :
l'infographie, les illustrations et le personnage restent à produire.

**Livrables du lot :**

| Fichier | Rôle |
| --- | --- |
| `nurtura-styleguide.html` | Styleguide interactif — tous les composants en rendu réel, bascule thème Enfant/Parent, 4 écrans de référence |
| `tokens/tokens.json` | Source de vérité des tokens, agnostique de plateforme |
| `tokens/theme.ts` | Transposition typée pour React Native / Expo |
| `NURTURA-UI-GUIDELINES.md` | Ce document — règles, patterns, checklist de handoff |

---

## Avertissements de méthode

Trois points d'honnêteté avant d'entrer dans le détail.

**1. Le nom produit n'est pas arrêté.** Le CR du 7 mai 2026 note un risque juridique sur
« IAdibou » (proximité avec la marque Adibou d'Ubisoft). Les tokens sont donc nommés
`brand` / `primary` et jamais `iadibou` : un renommage ne demandera aucun refactor.
J'utilise « Nurtura » dans ce document comme nom de travail, cohérent avec les documents
plus récents du projet.

**2. Aucune décision produit n'est prise ici.** Les questions ouvertes du cadrage
(tranche d'âge exacte, seuil de bascule « mode pédagogique strict », périmètre
disciplinaire) ne sont pas tranchées par ce système. Là où il fallait montrer quelque
chose à l'écran, j'ai pris une hypothèse et je le signale explicitement.

**3. Les données affichées dans le styleguide sont fictives.** Prénoms, minutes,
matières : ce sont des valeurs de dimensionnement, pas des résultats d'entretiens.
Les entretiens utilisateurs prévus au rétroplanning n'ont pas encore été restitués à ma
connaissance ; ce système est donc à confronter au terrain, pas à considérer comme validé.

---

## 1. La tension à résoudre, et comment on la résout

Les trois références que tu as partagées sont d'excellentes apps EdTech sur le plan
graphique — et elles portent toutes des mécaniques que le positionnement Nurtura refuse :
« A series of Olympiads », « Rating of students · 10 best students », séries de jours,
trophées, progression globale affichée en pourcentage.

Ce refus n'est pas cosmétique. Il est documenté dans le teardown concurrentiel du
2 août 2026 comme l'un des trois piliers de défendabilité du produit, à côté du binôme
parent/enfant et du livrable audio quotidien. Le même document rappelle honnêtement que
c'est un **pari commercialement risqué** : la gamification tire l'usage chez tous les
concurrents. Le système doit donc réussir un exercice difficile — être aussi **désirable**
que les références sans emprunter leurs leviers.

**La règle qui tranche : on reprend la forme, on écarte la mécanique.**

| On garde (forme) | On écarte (mécanique) |
| --- | --- |
| Cartes à grand rayon, aplats de couleur pleine page | Trophées, olympiades, roue de la fortune, boutique |
| Bouton pill sombre avec pastille circulaire portant la flèche | Séries de jours consécutifs, flammes, compteurs à ne pas casser |
| Grands chiffres en tête de tuile, unité en petit | Classements, « 10 best students », comparaison entre enfants |
| Barre d'onglets flottante arrondie | XP, niveaux, badges compétitifs |
| Chips de matières colorées défilant horizontalement | Pourcentage de progression global affiché à l'enfant |
| Illustrations et mascotte côté enfant | Notifications à aversion pour la perte |

Concrètement, ça veut dire que **le ludique passe par le graphisme et le mouvement, pas
par le système de récompense**. Une app peut être joyeuse sans être un casino.

---

## 2. Deux applications, un seul système

Décision retenue : **système unifié, deux thèmes**. Les primitives (palette, échelle
typographique, espacement, motion) sont partagées ; seuls les rôles sémantiques et
trois valeurs de forme changent.

| | **Enfant** | **Parent** |
| --- | --- | --- |
| Registre | Ludique, coloré, respirant | Sobre, dense, orienté données |
| Fond | Sable `#FFF8F2` | Gris froid `#F6F7FB` |
| Rayon de carte | 28 | 20 |
| Hauteur de contrôle | 56 | 52 |
| Typo de titre | Nunito 800 | Inter 700 |
| Action primaire | Encre `#171A23` | Indigo `#5A4FE0` |
| Densité | 1 idée par bloc, beaucoup d'air | Tuiles compactes, comparaisons |

**Pourquoi un système unique plutôt que deux :** parce que le produit repose sur un
binôme. Le parent ouvrira l'app enfant, l'enfant verra parfois celle du parent. Une
rupture visuelle totale casserait la lecture « c'est le même dispositif ». Et
techniquement, deux design systems à maintenir pour un MVP à livrer mi-septembre est
un coût qu'on ne peut pas se permettre.

L'implémentation : un seul `ThemeProvider`, deux objets `childTheme` / `parentTheme`
exportés depuis `theme.ts`. Aucun composant ne connaît son thème — il consomme
`useTheme()`.

---

## 3. Fondations

### 3.1 Couleur

**Palette de marque**

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Primary 600 — Indigo | `#5A4FE0` | Action parent, accent enfant, sélection, focus |
| Primary 700 | `#3D33B8` | Fond des cartes héro, texte sur teinte claire |
| Neutral 900 — Encre | `#171A23` | Texte principal, bouton primaire enfant, tab bar |
| Accent 500 — Abricot | `#FF8A4C` | **Décoratif uniquement** (2,3:1 sur blanc) |
| Accent 700 | `#A63F10` | Version texte de l'abricot |
| Sage 600 — Progression | `#26856D` | Avancement, effort constaté |
| Amber 700 — Attention | `#8A5A00` | Signal doux côté parent |
| Danger 600 — Erreur | `#C93838` | **Réservé** aux erreurs système et de saisie |

**Trois règles de couleur non négociables :**

1. **Le rouge ne qualifie jamais l'enfant.** Il signale une panne réseau, un champ
   invalide, une action destructrice. Jamais « mauvaise réponse », jamais « en retard sur
   l'objectif ». Cette règle est encodée dans les noms de tokens : il n'existe pas de
   token `colorBad` ou `colorFail`.
2. **Le vert n'est pas une félicitation, c'est une mesure.** `sage` porte la progression
   factuelle (« 12 min de recherche autonome »), pas le jugement (« Bravo ! »).
3. **La couleur ne porte jamais seule une information.** Toute matière colorée est doublée
   d'un libellé, tout état est doublé d'un texte ou d'une icône.

**Couleurs par matière** — chaque matière a un triplet `ink` (texte) / `tint` (fond) /
`solid` (aplat). Les six paires `ink` sur `tint` ont été vérifiées à ≥ 4,5:1.

| Matière | ink | tint | contraste |
| --- | --- | --- | --- |
| Maths | `#3D33B8` | `#E9E7FD` | 7,32:1 |
| Français | `#A63F10` | `#FFEADF` | 5,42:1 |
| Sciences | `#1E6B58` | `#DFF3ED` | 5,51:1 |
| Histoire-Géo | `#A63A6E` | `#FBE6F0` | 5,12:1 |
| Anglais | `#1F6BA8` | `#E2F0FB` | 4,85:1 |
| Arts | `#8A5A00` | `#FDF0CE` | 5,23:1 |

### 3.2 Typographie

Deux familles seulement.

- **Nunito** (600/700/800) — titres côté enfant. Rondeur sans infantilisation, bon support
  des accents français, lisible en grande taille.
- **Inter** (400/500/600/700/800) — toute l'interface, tous les chiffres, tous les titres
  côté parent. Chiffres en `tabular-nums` pour que les colonnes s'alignent.

**Échelle** (taille / interligne / graisse) : `displayXl 34/40/800` · `displayL 28/34/800` ·
`h1 24/30/700` · `h2 20/26/700` · `h3 17/24/600` · `bodyL 17/26/400` · `body 15/23/400` ·
`caption 13/19/400` · `label 13/18/600` · `micro 11/15/600` · `numberXl 40/44/800`.

**Règles de lecture :** interligne minimum 1,45× · jamais de texte justifié · longueur de
ligne ≤ 60 caractères · alignement à gauche uniquement · `allowFontScaling` toujours actif.

Le public a 11 ans et plus, et une partie non négligeable des élèves de 6e a des troubles
DYS. Une **option « police lisible »** (Atkinson Hyperlegible) est prévue dans les
réglages des deux apps. Ce n'est pas un gadget : c'est une décision de conception à
valider en entretien, pas à trancher en réunion.

### 3.3 Espacement, forme, élévation

- **Grille 4 pt** : 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64. Aucune valeur hors grille.
- **Marge d'écran** : 20 px. **Écart entre sections** : 28 px. **Entre cartes** : 12 px.
- **Rayons** : 8 / 12 / 16 / 20 / 28 / 32 / pill. Les contrôles sont **toujours** en pill —
  c'est la signature de forme du produit, celle qui rend l'interface « moderne » au premier
  coup d'œil.
- **Élévation** : trois niveaux d'ombre douce, teintée encre. Pas de bordure ET d'ombre sur
  le même élément — on choisit.

### 3.4 Mouvement

| Durée | Usage |
| --- | --- |
| 120 ms | Micro-retour (appui d'un bouton) |
| 180 ms | Bascule d'état (switch, chip) |
| 240 ms | Standard (apparition d'un bloc) |
| 320 ms | Entrée d'une feuille modale |
| 400 ms | Transition d'écran |

Courbe standard : `cubic-bezier(.2,.8,.2,1)`. Appui = `scale .97` sur 120 ms.

**Deux règles :** `AccessibilityInfo.isReduceMotionEnabled` est respecté partout, et
**aucune animation de célébration n'est déclenchée par une performance**. Une célébration
sobre est autorisée à la fin d'une session (l'effort est allé au bout) ; jamais sur la
justesse d'une réponse. C'est la traduction en motion du parti-pris anti-gamification.

---

## 4. Boutons

### Anatomie

Forme unique : **pill**. Hauteur 56 (enfant) / 52 (parent), 48 minimum ailleurs.
Libellé 17 px semi-gras côté enfant, 15–17 côté parent. Icône 20 px, écart de 8.

### Les six variantes, et une seule règle de hiérarchie

| Variante | Quand |
| --- | --- |
| **Primaire avec affordance** | L'action principale de l'écran. Pastille circulaire à droite portant la flèche — c'est le geste visuel signature repris des références. |
| **Primaire** | Validation, confirmation. |
| **Secondaire** | Alternative de même niveau (« Plus tard »). Contour `#848BA0` + surface. |
| **Tonal** | Action fréquente mais non principale (« Écouter le résumé »). |
| **Ghost** | Action de sortie ou de report (« Passer cette étape »). |
| **Destructeur** | Suppression de compte ou de données. Jamais dans la même rangée que le primaire. |

**Un seul bouton primaire visible par écran.** S'il y en a deux, l'un des deux n'est pas
primaire — c'est une question de hiérarchie mal résolue, pas de style.

**Bouton icône rond** : 56 / 48 / 40 px. C'est lui qui porte la flèche, le micro, le retour.
Il exige toujours un `accessibilityLabel`.

### États

| État | Traitement |
| --- | --- |
| Normal | Ombre `s2` |
| **Pressé** | `scale .97` + ombre réduite, 120 ms |
| Désactivé | Opacité 0,4, sans ombre, **avec un texte qui explique pourquoi** |
| Chargement | Largeur verrouillée **avant** de remplacer le libellé par le spinner |
| Focus | Anneau 2 px, décalage 2 px |

Le point sur l'appui mérite d'être insisté : sur mobile, le doigt masque le bouton. Un
simple changement de couleur est invisible. Le `scale` reste perceptible en périphérie.

### Segmented control et chips

- **Segmented** : 2 à 3 options, pour changer de vue sur **les mêmes données**
  (Semaine / Mois). Hauteur totale 48 — c'est le conteneur qui est la cible tactile, pas
  la pastille intérieure.
- **Chips** : pour **filtrer une liste**. Défilement horizontal, jamais deux rangées
  empilées. Hauteur visuelle 40 + `hitSlop={{top:4, bottom:4}}` pour atteindre 48.

---

## 5. Formulaires

C'est ici que se joue le **risque n°3 identifié au cadrage** : *« feature riche →
onboarding lourd → friction → abandon avant la première utilisation par l'enfant »*.
Le CR pose directement la question : « est-ce qu'on doit livrer des presets par défaut et
cacher le reste ? »

**La réponse du système est oui, et elle est structurelle.**

### Les sept règles

1. **Le label reste toujours visible au-dessus du champ.** Jamais de placeholder tenant
   lieu de label : il disparaît à la saisie et l'utilisateur perd le contexte, surtout sur
   un formulaire long.
2. **Une question par écran** dans les parcours d'onboarding. Ailleurs, 5 champs visibles
   maximum.
3. **Presets d'abord, réglages fins repliés.** Les deux premières options d'un choix sont
   des presets nommés (« Après l'école · 17h – 19h »), « Personnaliser » vient en troisième
   et n'ouvre le détail qu'à la demande.
4. **Cartes tactiles plutôt que boutons radio.** Un radio natif fait 20 px, sous la cible
   minimale. On utilise des cartes de 64 px dont **toute la surface** est cliquable.
5. **Validation au blur, jamais à la frappe.** Une fois le champ en erreur, il se revalide
   à chaque frappe pour que la correction soit immédiatement récompensée.
6. **Le message d'erreur dit quoi faire, pas ce qui est faux.** « Choisissez une classe pour
   adapter les exercices », pas « Champ obligatoire ».
7. **Les réglages s'appliquent immédiatement**, sans bouton « Enregistrer », avec un toast
   d'annulation de 5 secondes.

### Le champ de saisie

Hauteur 56, rayon 16, fond `surfaceSunken`, bordure 1,5 transparente au repos qui devient
`accent` au focus avec un halo de 4 px. Aide en 13 px sous le champ. En erreur : bordure
et fond `danger`, message avec icône.

**Côté React Native**, quatre props qui font 80 % de la qualité perçue d'un formulaire et
qu'on oublie systématiquement : `keyboardType`, `textContentType` (remplissage automatique
iOS), `autoComplete` (Android), `returnKeyType` (`next` puis `done`). À cela s'ajoutent
`KeyboardAvoidingView` et le bouton de soumission épinglé au-dessus du clavier.

### Le curseur nommé — cas de la « température pédagogique »

Le réglage central du contrôle parental est abstrait. Deux règles :

- **Il est nommé, pas numéroté.** « Équilibré », pas « 3/5 ». Un parent ne sait pas ce que
  vaut un 3 sur 5 d'exigence pédagogique.
- **Sa conséquence concrète s'affiche en direct** sous le curseur : « Le coach laissera Léa
  chercher environ 2 minutes avant de proposer un indice. »

Le thumb fait 28 px avec zone tactile étendue à 48. Retour haptique léger à chaque cran.

### Parcours multi-étapes

Progression toujours visible (« Étape 2 sur 4 »), **sortie sans perte à chaque étape**
(« Reprendre plus tard » sauvegarde l'état), retour possible.

**Cible à instrumenter :** le parent doit pouvoir atteindre la première session de l'enfant
en moins de 3 minutes. Au-delà de 4 étapes, l'onboarding devient un point de mesure
obligatoire — c'est exactement le test proposé au cadrage (« faire un parcours d'onboarding
et le passer à 5 parents, observer où ils décrochent »).

---

## 6. Listes

Trois formats seulement : **ligne simple** (64 px), **ligne à deux niveaux** (76 px),
**carte**. Le format par défaut est la **liste groupée en carte** : rayon de carte, ombre
douce, séparateurs internes.

### Anatomie d'une ligne

`[vignette 44×44, rayon 14, teintée matière] [titre 15/600 tronqué sur 1 ligne] [sous-titre 13 contextuel] [chevron ou valeur]`

- **Séparateur encastré** : il démarre à l'aplomb du texte (78 px), jamais bord à bord —
  sinon la vignette semble détachée de sa ligne.
- **Pas de chevron si rien ne s'ouvre.** Une ligne de données pure n'est pas cliquable.
- **Aucune note, aucun score, aucun pourcentage de réussite dans une ligne.** Le sous-titre
  décrit l'effort et le contexte : « 14 min · a cherché seule 6 min », pas « 8/10 ».

### Les quatre états — tous obligatoires

| État | Traitement |
| --- | --- |
| **Chargement** | Skeletons à la forme du contenu, jamais un spinner centré. La page garde sa structure, l'attente perçue baisse. |
| **Vide** | 4 blocs : visuel, titre court, une phrase d'explication, une action. Jamais un écran blanc. |
| **Erreur** | Même structure que l'état vide + bouton « Réessayer ». |
| **Plein** | Pull-to-refresh, chargement progressif avec indicateur en pied de liste. |

Une liste livrée sans ses quatre états est une liste non terminée. C'est un critère de
revue de code, pas une préférence.

### Autres règles

- **Actions par balayage** : 2 maximum, et toujours doublées d'un accès dans un menu —
  le balayage n'est pas découvrable et n'est pas accessible au lecteur d'écran.
- **Recherche** : dans le contenu défilant (pas dans la barre de navigation), déclenchement
  à 300 ms de debounce, minimum 2 caractères.
- **En-tête de section** : 13/700, collant en haut de liste.

---

## 7. Navigation

- **Barre d'onglets flottante**, rayon pill, fond encre, 64 px de haut, **4 destinations
  maximum**. L'onglet actif porte une pastille colorée. Zone de sécurité basse respectée.
  - Enfant : Accueil · Matières · Progrès · Profil
  - Parent : Aujourd'hui · Analyses · Réglages · Compte
- **Retour** : bouton rond 44 px en haut à gauche, **en plus** du geste de balayage natif,
  jamais à la place.
- **Feuilles modales** plutôt qu'empilement d'écrans : poignée visible, rayon 28 en haut,
  deux paliers de hauteur, fermeture par balayage ET par le fond assombri. Deux actions
  maximum par feuille.
- **Modale plein écran** réservée aux parcours (onboarding, session).

---

## 8. Cartes et visualisation de données

Le cœur de la valeur côté parent, c'est l'analytics **comportemental** — persévérance,
régularité, recours à l'aide. Le teardown identifie ce point comme le socle de
défendabilité : personne en France ne délivre ça à un parent aujourd'hui.

### Règles de représentation

1. **On montre la forme de l'effort, jamais un jugement.** Pas de vert « bien » contre
   rouge « mal », pas de note globale, pas d'objectif en pointillés à ne pas franchir.
2. **Une seule couleur d'accent par graphique.** Échelle d'intensité à 3 paliers
   (`#CFCBF8` → `#8C84EE` → `#5A4FE0`) plus un état vide neutre avec contour.
3. **L'absence de donnée n'est pas un zéro rouge.** Un jour sans session est simplement
   plus clair. Ce n'est pas un échec, et le graphique ne doit pas le faire ressentir.
4. **La comparaison se fait avec l'enfant lui-même**, la semaine précédente. Jamais avec
   d'autres enfants, jamais avec une moyenne de classe.
5. **Toute valeur graphique est doublée d'un texte** accessible au tap et présente dans le
   résumé — le graphique n'est jamais le seul porteur de l'information.

### Deux visualisations pour le MVP

- **Régularité** : grille de points sur 4 semaines, 3 niveaux d'intensité + vide, avec
  légende « Moins → Plus ».
- **Persévérance** : barres verticales « temps avant de demander de l'aide », jour par jour.

### La note vocale

Elle est l'**objet principal** de l'écran « Aujourd'hui », pas un encart secondaire. Carte
héro pleine largeur, bouton de lecture rond, durée affichée. C'est le format le plus
différenciant identifié dans le teardown ; le traiter comme une notification serait passer
à côté.

---

## 9. Accessibilité — vérifié, pas déclaré

Les contrastes ont été calculés programmatiquement sur les 37 paires du système
(formule WCAG 2.1). **37/37 conformes** après quatre corrections :

| Correction | Avant | Après |
| --- | --- | --- |
| Texte discret (`textMuted`) | `#767D90` — 4,11:1 | `#686F82` — 5,02:1 |
| Sous-titre sur carte héro | blanc 82 % sur `#5A4FE0` — 4,00:1 | `#E4E1FA` sur `#3D33B8` — 6,96:1 |
| Encre matière Français / Abricot 700 | `#B84A18` — 4,49:1 | `#A63F10` — 5,42:1 |
| Bordure de contrôle interactif | `#C2C7D4` — 1,69:1 | `#848BA0` — 3,40:1 |

**Deux exceptions assumées et documentées :**

- **Abricot 500 `#FF8A4C`** ne fait que 2,34:1 sur blanc. Il est classé *décoratif
  uniquement* dans les tokens : aplats, illustrations, vignettes. Jamais de texte fin.
- **Les paliers clairs de la data viz** n'atteignent pas 3:1 contre le blanc. C'est
  acceptable au titre de WCAG 1.4.11 parce que les paliers sont distinguables **entre eux**
  et que la valeur exacte est accessible en texte. C'est une exception justifiée, pas un
  oubli.

**Séparateurs de liste** : `#DEE2EA` à 1,3:1 — c'est volontaire. Ce sont des éléments
décoratifs, hors périmètre de 1.4.11. La limite d'un contrôle dont la bordure **est**
l'affordance utilise `borderInteractive` à 3,4:1.

### Checklist à faire respecter en revue

- [ ] Toute zone tactile ≥ **48 × 48 px**. Visuel plus petit → `hitSlop`, jamais une icône grossie.
- [ ] Écart minimum de 8 px entre deux cibles.
- [ ] Contraste texte ≥ 4,5:1, éléments d'interface ≥ 3:1.
- [ ] La couleur ne porte jamais seule une information.
- [ ] `accessibilityLabel` + `accessibilityRole` + `accessibilityState` sur tout élément interactif.
- [ ] Chaque écran testé à **200 % de taille de police**.
- [ ] `AccessibilityInfo.isReduceMotionEnabled` respecté.
- [ ] Ordre de focus du lecteur d'écran vérifié sur les parcours d'onboarding.

---

## 10. Ton et microcopie — la partie qui fait vraiment la différence

Le positionnement anti-culpabilisation se joue autant dans les mots que dans les pixels.
Un même écran, deux façons de l'écrire :

**À bannir**

> 🔥 **Série de 5 jours !**
> Ne casse pas ta série — il te reste 3 h.
> Score : 62 % — en dessous de ton objectif

Cette formulation crée de l'anxiété, déplace l'attention de l'apprentissage vers la
protection du compteur, et transforme un jour de repos en faute.

**Attendu**

> **Hier, tu as tenu 12 minutes sur les fractions.**
> C'est 4 de plus que la semaine dernière.
> Tu veux reprendre où tu t'es arrêtée ?

Elle constate un fait passé, compare l'enfant à lui-même, et propose une action sans
injonction.

### Les règles

| Règle | Pourquoi |
| --- | --- |
| Pas de point d'exclamation dans les messages système | Il transforme une information en injonction |
| Pas d'impératif culpabilisant | « Ne casse pas », « Tu dois », « Il te reste » |
| Pas de vocabulaire d'échec | Ni « raté », ni « erreur », ni « échec » pour l'enfant |
| Constat au passé, proposition au présent | « Tu as tenu 12 min. Tu veux reprendre ? » |
| Aucun score global montré à l'enfant | Les analytics comportementaux sont un livrable **parent** |
| Le vouvoiement pour le parent, le tutoiement pour l'enfant | Deux registres, deux relations |
| Un message d'attention constate et normalise | « Pas de session depuis 4 jours. C'est fréquent en période de vacances. » |

Le principe « l'IA ne donne jamais de réponses » a aussi une conséquence d'interface :
il doit être **rappelé à l'enfant dans le contexte**, comme une règle du jeu comprise à
l'avance et non comme un refus subi. Dans le styleguide, l'écran de session porte cette
mention en pied de conversation.

C'est le point le plus fragile du produit — le CR du 7 mai le pose sans détour (« contrôle
demain matin, l'enfant est bloqué à 21h, que fait l'app ? »). L'interface ne résoudra pas
cette question à la place du produit, mais elle peut faire la différence entre une règle
acceptée et une frustration.

---

## 11. Ce qui reste à produire

| Élément | Statut | Qui |
| --- | --- | --- |
| Personnage / mascotte enfant (le renard est un placeholder) | À créer | Direction artistique |
| Jeu d'illustrations pour les états vides et l'onboarding | À créer | Direction artistique |
| Jeu d'icônes complet (16 pictogrammes en 24 px, trait 2 px) | À créer | Direction artistique |
| Icône d'application et écran de lancement | À créer | Direction artistique |
| Thème sombre | Non traité en v0.1 | À arbitrer |
| Sons et haptique | Non traité | À arbitrer |
| Tablette et grands écrans | Hors périmètre MVP | — |

**Les tokens sont prévus pour absorber ces ajouts sans refonte** : les couleurs
d'illustration se branchent sur `accent` et `subject`, la mascotte occupe les emplacements
déjà réservés dans les cartes héro et les états vides.

---

## 12. Handoff — ce qu'on demande à Claude Design, puis au dev

### À Claude Design

Le styleguide HTML est la référence visuelle. Ce qu'il faut lui demander de produire :

1. Les **écrans manquants** du parcours enfant (onboarding, fin de session, historique) et
   du parcours parent (première configuration, détail d'une session, analyses).
2. Les **variantes d'état** de chaque écran : chargement, vide, erreur, hors créneau horaire.
3. Le **jeu d'illustrations** et la mascotte, en respectant la palette `accent` / `subject`.

Ce qu'il ne faut **pas** lui laisser inventer : de nouvelles couleurs, de nouveaux rayons,
de nouvelles hauteurs de contrôle, ou une mécanique d'engagement. Le système est fermé sur
ces points — c'est ce qui garantit la cohérence entre les deux apps.

### Au premier dev

**Ordre de construction recommandé :**

1. `theme.ts` + `ThemeProvider` + hook `useTheme()`
2. Primitives : `Text`, `Box`, `Pressable` avec l'appui `scale .97` intégré
3. `Button` (6 variantes × 3 tailles × 5 états) et `IconButton`
4. `TextField`, `RadioCard`, `Switch`, `Slider`, `Segmented`, `Chip`
5. `ListRow`, `ListGroup`, `EmptyState`, `Skeleton`
6. `TabBar`, `AppBar`, `BottomSheet`
7. `Card`, `StatTile`, `HeroCard`
8. Écrans

**Règles de code non négociables :**

- Aucune valeur brute (`#hex`, padding en dur) dans un composant d'écran. Tout passe par
  `useTheme()`. Une règle de lint peut le vérifier.
- Un composant ne connaît pas son thème.
- Chaque composant est livré avec ses états — un `Button` sans état de chargement n'est
  pas terminé.
- Les noms `streak`, `leaderboard`, `xp`, `classement` sont interdits dans le code
  (constante `FORBIDDEN_PATTERNS` dans `theme.ts`). S'ils apparaissent dans une PR, c'est
  un bug produit, pas un détail de nommage.

**Points de mesure à instrumenter dès le MVP**, parce qu'ils testent directement les
hypothèses du cadrage :

| Mesure | Hypothèse testée |
| --- | --- |
| Taux de complétion de l'onboarding parent, étape par étape | H3 — le contrôle parental granulaire sera-t-il utilisé ? |
| Part de parents qui touchent aux réglages avancés | H3 — les presets suffisent-ils ? |
| Part de parents qui écoutent la note vocale ≥ 4 soirs / 7 | Seuil de bascule identifié dans le teardown (> 60 %) |
| Abandons de session enfant après un refus de réponse du coach | H2 — « jamais de réponses » : promesse ou frustration ? |

---

## Sources

Ce document s'appuie sur les documents du projet AIdibou :

- **CR-Meeting-Cadrage-IAdibou.docx** (Sandra Boisloret & Chris Folla, meeting du 7 mai 2026)
  — architecture à deux applications, contrôle parental granulaire, principe « l'IA ne
  donne jamais de réponses », hypothèses 1 à 3, risque juridique sur le nom.
- **CR-Point-Retroplanning-20juin2026.docx** (Sandra Boisloret & Chris Folla, meeting du
  20 juin 2026) — cœur produit en trois fonctions, approche par tranches d'âge, priorité à
  l'entrée vocale, objectif MVP mi-septembre 2026, action « coder l'application enfant et
  préparer une démonstration (design + code) ».
- **Wilgo Competitive Teardown and French EdTech Mapping** (2 août 2026) — parti-pris
  anti-gamification comme pilier de défendabilité et comme risque commercial, note vocale
  parent comme format unique, analytics comportementaux (persévérance, régularité,
  help-seeking) comme white space, seuil de validation « > 60 % des parents écoutent la
  note ≥ 4 soirs / 7 ».

Les seuils d'accessibilité appliqués sont ceux de **WCAG 2.1 niveau AA** (critères 1.4.3
contraste du texte, 1.4.11 contraste des éléments non textuels, 2.5.5 taille de cible).
La cible tactile de 48 px retenue est celle des **Material Design guidelines** (48 dp),
qui englobe le minimum des **Apple Human Interface Guidelines** (44 pt).

Les ratios de contraste cités ont été calculés programmatiquement dans cette session avec
la formule de luminance relative WCAG ; ils sont reproductibles à partir des valeurs
hexadécimales des tokens.

---

*Nurtura — Guidelines UI/UX mobile v0.1 · 13 août 2026 · Document de travail interne.*
