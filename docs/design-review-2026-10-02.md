# Revue des prototypes Claude Design — 2 octobre 2026

> **Statut : document de travail, non autoritatif.** Comme `design-review-2026-07-31.md`, il est
> issu d'une session Claude. Il constate des écarts ; il ne tranche rien. Chaque question
> qu'il soulève est reprise dans `DECISIONS-OUVERTES.md` §7.

Prototypes revus (archivés dans `design/prototypes/`, références visuelles uniquement) :

- `Nurturia Phone Enfant.dc.html` : mode enfant sur téléphone
- `Nurturia Phone Parent.dc.html` : mode parent sur téléphone
- `Nurturia Parent.dc.html` : tableau de bord parent web, écrans de consentement

Référentiels de comparaison : `CLAUDE.md`, `docs/UI-GUIDELINES.md` (§2, §3 à §10, §12),
`docs/PARCOURS.md` (§2 à §4), `EVENEMENTS.md`, `src/theme/theme.ts`.

---

## 1. Identité visuelle : les prototypes sortent du système de design

`UI-GUIDELINES.md` §12 demande explicitement de ne pas laisser Claude Design « inventer de
nouvelles couleurs, de nouveaux rayons ». Les prototypes utilisent pourtant une autre palette
et une autre typographie, **dans les deux modes** :

| | `UI-GUIDELINES.md` §2 / `theme.ts` | Prototypes |
| --- | --- | --- |
| Fond enfant | Sable `#FFF8F2` | Bleu clair `#DDE7F8` |
| Fond parent | Gris froid `#F6F7FB` | `#F5F6FA` / `#EEF1F6` |
| Action primaire enfant | Encre `#171A23` | Marine `#0F1B35` |
| Action primaire parent | Indigo `#5A4FE0` | Marine `#0F1B35` |
| Accent | `#FF8A4C` / `#E0631F` | `#FF9F66` / `#F27121` |
| Typographie | Nunito 800 (enfant), Inter 700 (parent) | Plus Jakarta Sans partout |
| Rayons de carte | 28 (enfant), 20 (parent) | 18 à 30, sans règle apparente |

Point de contexte : la revue du 31 juillet évoquait déjà une « palette enfant
marine/crème/orange » face à une « palette marque violet/corail ». Les nouveaux prototypes vont
plus loin, puisque **le mode parent abandonne aussi le violet**. Ce n'est donc plus un conflit
entre deux univers, mais un remplacement complet de l'identité.

**Conséquence pour le code :** aucune valeur des prototypes ne peut entrer dans `theme.ts`
tant que la palette n'est pas validée et livrée sous forme de `design/tokens.json`
(`design/README.md`).

## 2. Ce qui est conforme aux invariants

À signaler pour ne pas le perdre au moment de l'implémentation :

- **Verrou du mode enfant** (`CLAUDE.md` §6) : code à 6 chiffres, pause d'une minute après
  3 essais, biométrie proposée seulement sur l'appareil marqué « appareil du parent »,
  « Code oublié » par lien e-mail. Un écran dédié montre que l'app rouverte reste en mode enfant.
- **Pas de mécanique compétitive** : ni série, ni badge, ni classement. Le rouge n'apparaît
  que dans l'écran d'appel système simulé, jamais pour qualifier l'enfant.
- **Comparaison avec soi-même** : les signaux parent sont comparés uniquement à la période
  précédente de l'enfant, avec la mention explicite qu'un jour sans session n'a rien d'anormal.
- **Quatre états de liste** côté parent (chargement en skeletons, vide, erreur, rempli), plus
  un état « nouveau compte ».
- **Accessibilité** : cibles de 48 pt au minimum, texte jusqu'à 200 %, réduction des
  animations respectée (la progression affiche directement l'état final).
- **Transparence IA (AI Act art. 50)** : un badge « IA » sur les messages générés et un écran
  « Comment ça marche ? » côté enfant et côté parent.
- **Consentements** : historisés et versionnés (« texte v1.0 »), révocables finalité par
  finalité, conformes à `DECISIONS-OUVERTES.md` §4.3. Un second parent peut être invité (§4.1).
- **Journal des échanges et signalement** présents côté parent, conformes à §3.7.
- **Suppression du compte** confirmée dans une feuille, conformément à l'invariant 17.

## 3. Décisions produit que les prototypes supposent sans qu'elles soient prises

Chaque point ci-dessous est un **choix plausible non signalé** au sens de `CLAUDE.md` §8.
Aucun n'est faux en soi ; tous doivent être tranchés avant d'être codés.

### 3.1 Le résumé vocal quotidien a disparu

`CLAUDE.md` §1 définit le mode parent par « suivi comportemental et un résumé vocal
quotidien », et `PARCOURS.md` §4 prévoit le réglage « résumé vocal du soir ». Les prototypes
le remplacent par un « résumé de la semaine, le dimanche soir, par notification » et par un
tableau de bord détaillé. Le pipeline vocal (`DECISIONS-OUVERTES.md` §2.4) n'apparaît nulle part.

### 3.2 Une deuxième surface : le tableau de bord web

Les prototypes ajoutent un espace parent web en lecture seule, avec sa propre connexion.
`CLAUDE.md` décrit une application mobile unique. C'est une surface de plus à construire,
sécuriser et héberger, qui dépend du backend (§2.1).

### 3.3 Un modèle pédagogique : erreurs récurrentes et règles d'enseignants

Le cœur du suivi parent devient un **modèle d'erreurs récurrentes** (statuts « active »,
« en cours », « résolue »), avec une règle de résolution précise : « 3 réponses correctes sans
aide, sur au moins 2 jours différents ». L'écran de transparence affirme que « les réponses
sont vérifiées par des règles fixes, écrites par des enseignants » et que les conseils aux
parents viennent « d'une bibliothèque validée, non générée par l'IA ».

Ce sont des **définitions calculatoires de signaux** (§3.6), une **architecture du coach**
(§2.2, §3.1 : le contrôle de la réponse est déterministe et l'IA ne fait que reformuler) et un
**référentiel de contenu** (§3.8). Tout cela est présenté au parent comme des faits. Ce ne
sont pas des valeurs à reprendre telles quelles.

### 3.4 L'interprétation de « le coach ne donne jamais la réponse »

Trois mécaniques des prototypes engagent l'invariant n° 1 :

- **« Exemple qui ressemble »** : après trois réponses non attendues, l'enfant voit un exemple
  entièrement résolu, avec d'autres nombres. C'est une réponse possible à la question du
  blocage total (§3.4), qui doit être actée comme telle.
- **Explorer / « Demander à Néo »** : l'enfant peut poser n'importe quelle question
  (« Pourquoi la glace fond ? »). Le coach **explique la notion**, et ne refuse que si la
  question ressemble à un exercice, détecté dans le prototype par une simple expression
  régulière. Expliquer une notion est-il compatible avec l'invariant ? Où passe la frontière ?
- **« Comprendre une notion »** : des explications interactives guidées.

Ces trois choix relèvent du contrat pédagogique (§3.1), qui n'est pas écrit. Ils élargissent
aussi beaucoup le périmètre de sécurité (§3.7), puisque les questions de l'enfant deviennent ouvertes.

### 3.5 La photo de l'énoncé et la dictée

L'enfant peut **photographier l'énoncé imprimé** : le texte est reconnu par OCR, l'enfant le
vérifie, puis la photo est effacée. Il peut aussi **dicter** l'énoncé (transcription vocale).
Ce sont deux traitements de données de mineurs (image, voix) qui supposent :

- des fournisseurs OCR et de transcription, à définir (§2.1, §2.2) ;
- une finalité de consentement (le prototype l'inclut dans « Analyse du travail ») ;
- la promesse « effacée dès que tu valides », qui devient un engagement technique vérifiable.

La revue du 31 juillet demandait déjà la « transience obligatoire de l'audio et des photos ».

### 3.6 Le consentement de l'enfant

Les prototypes ajoutent un **accord de l'enfant**, demandé une fois avant la première session
et historisé (« texte enfant v1.0 »). Sans cet accord, aucune session ne démarre.
`PARCOURS.md` §2 prévoit la déclaration d'âge et les finalités séparées côté parent, mais pas
cet accord de l'enfant. C'est un ajout de flux et de schéma.

### 3.7 La confiance déclarée avant chaque réponse

Avant de voir les choix possibles, l'enfant indique « Je suis sûre / Je crois / Je ne sais
pas ». Côté parent, un écran entier croise cette confiance et le résultat. C'est un **signal
nouveau** que `EVENEMENTS.md` ne journalise pas.

### 3.8 « Mon parcours » et la carte des notions

L'enfant voit « Ce que tu sais faire maintenant » (avec une comparaison avant / maintenant),
« En train de travailler » et une carte des notions étiquetées (« Tu sais faire », « En cours »,
« Exploré », « Pas encore exploré »). La comparaison se fait bien avec soi-même et sans score.
**Point de vigilance :** une carte à compléter peut fonctionner comme une mécanique de
collection, ce qui frôle l'invariant n° 2 (`FORBIDDEN_PATTERNS`). À valider explicitement.

### 3.9 Le nom du coach et de la mascotte

Le coach s'appelle **« Néo »** (propriété `mascotName`), alors que les fichiers d'illustration
s'appellent `nurtu-*.svg` et que la revue du 31 juillet parle de la mascotte « Nurtu ». Il faut
savoir si ce sont deux entités ou une seule, et quel nom est retenu. Comme pour `app.name`,
le nom doit passer par une clé de traduction.

### 3.10 Le périmètre disciplinaire

Six matières sont proposées à l'enfant, mais le détail des erreurs côté parent n'existe que
pour **les fractions**. Les autres matières n'affichent que des signaux de comportement. Cela
tranche implicitement §1.5 (« Maths, fractions » comme périmètre réel au lancement).

### 3.11 Les créneaux de disponibilité

Le réglage enfant propose trois créneaux (après l'école, mercredi après-midi, week-end), avec
des horaires précis. Le flux de dérogation en temps réel décrit dans la revue du 31 juillet
(D1) est absent. Les horaires affichés sont des valeurs de démonstration.

## 4. Écarts de détail à corriger à l'implémentation, pas à trancher

- **Microcopie genrée** : « Je suis sûre », « tu t'es arrêtée », « tu peux chercher seule »
  sont écrits au féminin pour Léa. L'i18n devra gérer le genre de l'enfant, ou reformuler en
  tournures neutres.
- **Plusieurs boutons primaires** par moments : l'écran « Aujourd'hui » du parent montre un
  bloc marine plein « Comment ça marche ? » et un bouton orange plein « Passer en mode
  enfant ». C'est à vérifier contre l'invariant 16.
- **Liste noire du code parent** (dates de naissance, suites, répétitions) : l'écran de
  création du code n'est pas prototypé, la règle reste à appliquer (`CLAUDE.md` §6).
- **Bouton « Donne-moi la réponse »** toujours visible dans le chat : c'est un choix de design
  (il rend la demande observable, cf. `answer_demanded`) à confirmer, pas un oubli.

## 5. Événements à ajouter à `EVENEMENTS.md` si les points 3.3 à 3.8 sont retenus

Aucun des événements suivants n'existe dans la spécification actuelle :

| Besoin du prototype | Événement manquant (nom indicatif) |
| --- | --- |
| Confiance déclarée | `confidence_declared` (niveau, avant affichage des choix) |
| Réponse à choix multiple | `answer_selected` (option, attendue ou non, stratégie d'erreur associée) |
| Erreur récurrente | `error_strategy_observed`, changement de statut |
| Saisie de l'énoncé | `statement_captured` (photo / écrit / dictée), `statement_confirmed`, `photo_deleted` |
| Exemple résolu | `worked_example_shown` (forcé ou demandé) |
| Exploration libre | `notion_opened`, `free_question_asked`, `quiz_started` (origine : enfant) |
| Accord de l'enfant | `child_assent_given` / `child_assent_declined` |

`EVENEMENTS.md` §1 pose qu'un événement non journalisé dès le premier commit est perdu. Si ces
mécaniques sont retenues, la mise à jour de la spécification est donc urgente.

---

*Nurturia — revue des prototypes · 2 octobre 2026 · non autoritatif.*
