# Nurturia — Décisions ouvertes

> **Ce document existe pour dire où ne pas improviser.**
>
> Chaque entrée décrit une question non tranchée, ce qu'elle bloque, et l'instruction à suivre.
> Si ta tâche touche l'un de ces sujets : implémente ce qui est indépendant de la décision,
> puis pose la question — en indiquant ce que tu ferais par défaut et pourquoi.
>
> **Ne comble jamais un vide par un choix plausible.** Un choix plausible non signalé se
> découvre en revue, parfois des semaines plus tard, quand il coûte une migration.
>
> Version 0.1 — 14 août 2026. Chaque décision tranchée sort de ce fichier et entre dans `CLAUDE.md`.

---

## Comment lire une entrée

| Champ | Sens |
| --- | --- |
| **Question** | Ce qui n'est pas tranché |
| **Depuis** | Où la question a été posée pour la première fois |
| **Bloque** | Ce qui ne peut pas être écrit correctement sans la réponse |
| **Instruction** | Ce que tu fais en attendant |

---

# 1 · Produit

### 1.1 Nom du produit — TRANCHÉ le 16 août 2026

**Décision** — le produit s'appelle **Nurturia**. Le nom est scellé : dépôt, identifiant de
bundle, documentation, interface. « IAdibou » et « Nurtura » sont abandonnés.

**Reste ouvert, et ce n'est pas une décision de conception** — la **recherche d'antériorité
au registre des marques n'a pas été faite**. Le risque initial portait sur la proximité entre
« IAdibou » et la marque Adibou d'Ubisoft ; choisir un autre nom ne supprime pas le risque,
il le déplace sur « Nurturia », qui n'a pas été vérifié. Action à confier à un conseil en
propriété industrielle, hors périmètre du code.

**Instruction** — écris `Nurturia` partout, **sauf dans une chaîne affichée** : tout libellé
visible passe par `i18n/fr.json`, clé `app.name`. Les tokens de marque restent `brand` /
`primary`. Cette règle survit à la décision, pour deux raisons : la localisation, et le fait
qu'un retour défavorable de la recherche d'antériorité doit rester un changement de clé de
traduction et d'asset, pas un refactor.

**Note de provenance** — le document `docs/design-review-2026-07-31.md` est issu d'une session
Claude, pas d'une décision d'équipe. Il n'est **pas autoritatif**. Sa mention de « Nurturia »
a coïncidé avec la décision, mais ne l'a pas produite ; ses autres affirmations (choix de
Supabase déduit d'une mention de RLS, « code de pairing ») restent non validées et ne doivent
pas être reprises.

### 1.2 Tranche d'âge cible

**Question** — 7-14 ans, 8-18 ans, ou entrée en 6e (11 ans) ?
**Depuis** — CR de cadrage, 7 mai 2026 : « Le Lean Canvas évoque 8-18 ans, le dossier YC
7-14 ans. Un produit pour un enfant de 7 ans n'a rien à voir avec un produit pour un ado de 17. »
Le CR du 20 juin retient deux stratégies distinctes : jeunes enfants pilotés par le parent,
adolescents utilisateurs principaux.
**Bloque** — le registre visuel du mode enfant, la complexité de la microcopie, et surtout
**qui est l'utilisateur principal** — ce qui change la hiérarchie de tous les écrans enfant.
**Instruction** — les maquettes existantes visent l'entrée en 6e (11 ans), parent au centre.
Code pour cette hypothèse, mais **ne durcis rien qui rendrait un second registre impossible** :
pas de composant nommé d'après une tranche d'âge, pas de seuil d'âge en dur hors configuration.

### 1.3 Multi-enfant : réglages et tarification

**Question** — les réglages sont-ils par enfant ou globaux ? La tarification est-elle par
enfant ou par famille ? Y a-t-il une vue agrégée ?
**Depuis** — CR de cadrage : « Par enfant ou par famille ? » Non tranché. Le sélecteur
« Léa / Tom » présent dans les maquettes est une **hypothèse de dimensionnement, pas une décision**.
**Bloque** — le modèle de données, la navigation de l'écran « Aujourd'hui », l'intégration
de facturation.
**Instruction** — modélise les réglages **par enfant** dès le départ (dégrouper est facile,
regrouper après coup demande une migration). Au-delà de trois enfants le sélecteur segmenté
ne tient plus visuellement : signale-le plutôt que d'inventer un autre composant.

### 1.4 Prix, essai gratuit, moment du paywall

**Question** — quel prix, quel modèle, essai gratuit ou non, et à quel moment du parcours
le paywall apparaît-il ?
**Depuis** — CR du 20 juin : 9,99 € évoqué comme élément de discussion, explicitement **non
arrêté**. Un concurrent à 30 € l'heure cité en contexte.
**Bloque** — trois écrans qui n'existent pas (paywall, gestion d'abonnement, résiliation),
le choix du système de facturation, et la place du paywall dans le parcours d'onboarding.
**Instruction** — **n'implémente aucun paywall.** Prévois un point d'extension dans le
routeur d'onboarding et un état `subscription` dans le modèle, sans logique de facturation.

### 1.5 Périmètre disciplinaire au lancement

**Question** — toutes les matières, ou une seule pour valider ?
**Depuis** — CR de cadrage, non tranché.
**Bloque** — le volume de contenu à produire, la navigation du mode enfant.
**Instruction** — le thème définit six matières (`subject` dans `theme.ts`). Traite-les comme
**données**, jamais comme code : aucune matière ne doit apparaître dans un nom de composant
ou une condition.
**Note du 2 octobre** — les prototypes proposent les six matières à l'enfant mais ne détaillent
les erreurs que pour les fractions. Cela tranche la question implicitement : ce n'est pas une décision.

---

# 2 · Technique

### 2.1 Backend, hébergement, résidence des données

**Question** — Supabase, Firebase, Node + Postgres auto-hébergé, autre ?
**Depuis** — jamais tranché dans les documents du projet.
**Bloque** — le modèle de données, l'authentification par lien magique, le stockage des
notes vocales, la planification de la génération du résumé du soir.
**Point d'attention** — il s'agit de données de mineurs français. La résidence des données
en UE est un argument commercial autant qu'un sujet de conformité ; ça devrait peser dans
le choix.
**Instruction** — **ne choisis pas.** Si tu dois avancer sur l'interface, travaille contre
une couche de service factice (`services/` renvoyant des données de démonstration) et une
interface TypeScript stable. Le jour où le backend est choisi, seule l'implémentation change.

### 2.2 Où tourne le coach IA

**Question** — API cloud d'un fournisseur, modèle embarqué sur l'appareil, ou hybride ?
**Depuis** — CR du 20 juin : « recourir à un modèle d'IA local pour garantir la fiabilité et
limiter les hallucinations. **Le terme reste à préciser techniquement.** » Il ne l'a pas été.
**Bloque** — l'architecture entière du mode enfant, la gestion du hors-ligne, le coût par
session, l'accord de sous-traitance, et l'argumentaire commercial auprès des parents.
**Point d'attention** — c'est l'écart entre **deux architectures incompatibles**, pas un
réglage. Un modèle embarqué tient difficilement un dialogue socratique de qualité ; une API
cloud impose des écrans dégradés partout et un cadre de sous-traitance.
**Instruction** — **n'écris aucun appel de modèle.** Isole toute interaction avec le coach
derrière une interface unique (`features/coach/CoachService.ts`) avec une implémentation de
démonstration. Signale toute conception qui présumerait de la latence ou de la disponibilité
réseau.

### 2.3 Catégorie App Store

**Question** — publier dans la catégorie Enfants, ou dans Éducation avec une classification 4+ ?
**Depuis** — soulevé le 13 août 2026 lors du travail sur le parcours mono-app.
**Bloque** — la place de tout ce qui est achat, lien sortant, CGU et support ; l'usage
d'analytics tiers ; la possibilité d'utiliser certains SDK.
**Point d'attention** — la directive 1.3 des App Review Guidelines interdit aux applications
de la catégorie Enfants les liens sortants, les opportunités d'achat et, en principe, les
analytics et la publicité de tiers, sauf derrière une barrière parentale.
**Instruction** — le parcours conçu est compatible avec les deux : **garde tout élément
sortant ou commercial derrière le code parent**, quelle que soit la décision. N'ajoute aucun
SDK d'analytics tiers avant l'arbitrage.

### 2.4 Pipeline de la note vocale

**Question** — quel fournisseur de synthèse vocale, quelle voix, quel coût par note, où sont
stockés les fichiers, et que se passe-t-il si la génération échoue ?
**Depuis** — identifié comme différenciateur n°1 dans le teardown du 2 août ; le pipeline
n'a jamais été spécifié.
**Bloque** — l'écran principal du mode parent, le stockage, la planification quotidienne.
**Instruction** — modélise la note vocale comme une **ressource asynchrone avec un état
explicite** (`pending`, `ready`, `failed`), pas comme un fichier toujours présent. L'écran
« Aujourd'hui » doit gérer les trois états dès sa première version.

---

# 3 · Pédagogie et IA

> **Cette section est le chemin critique du projet.** Rien de ce qui suit n'est spécifié, et
> aucun autre document ne le remplace. Tant qu'elle est vide, le mode enfant ne peut recevoir
> qu'une coquille.

### 3.1 Le contrat pédagogique du coach

**Question** — prompt système, comportement, interdits, gestion du hors-sujet, ton.
**Depuis** — jamais écrit.
**Bloque** — tout le mode enfant.
**Instruction** — **n'écris aucun prompt de coach.** Si on te demande d'en produire un,
réponds que le contrat pédagogique doit être écrit et validé par l'équipe produit d'abord.
Un prompt plausible et générique est le risque n°1 du projet : il paraîtra convenable en
démonstration et donnera les réponses en usage réel.

### 3.2 La bascule vers le « mode pédagogique strict »

**Question** — quand et comment le coach bascule-t-il ? Qui décide : le parent à la
configuration, l'IA en autonomie sur des critères, ou les deux ?
**Depuis** — CR de cadrage, 7 mai 2026, qui la qualifie de **« mécanique cœur du produit »**
et la laisse ouverte. Toujours ouverte trois mois plus tard.
**Bloque** — la sémantique du réglage « exigence du coach », donc l'écran de réglages le plus
important du mode parent.
**Instruction** — stocke le réglage comme une **valeur nommée** (`souple`, `equilibre`,
`exigeant`…) sans lui associer de comportement. N'invente aucun seuil.

### 3.3 Ce que « la température » change concrètement

**Question** — que fait le coach différemment entre « souple » et « exigeant » ?
**Depuis** — la mention « le coach laissera Léa chercher environ 2 minutes avant de proposer
un indice » figure dans les maquettes. **C'est une valeur inventée pour dimensionner un écran,
pas une décision produit.** Ne la traite pas comme une spécification.
**Bloque** — la sémantique du curseur, le texte de conséquence affiché sous lui.
**Instruction** — le texte de conséquence est une **chaîne de traduction paramétrable**, pas
une valeur calculée. Ne code aucun minuteur.

### 3.4 Le comportement en cas de blocage total

**Question** — l'enfant est totalement bloqué à 21h, contrôle le lendemain. Que fait
l'application ?
**Depuis** — CR de cadrage, « trou dans la cuirasse n°2 ». Le document pose la question
frontalement : « est-ce qu'on tient cette ligne même si 30 % des parents nous quittent ? »
Non tranché.
**Bloque** — le scénario le plus probable du produit.
**Instruction** — ne code aucune porte de sortie, et n'en supprime pas la possibilité. Le
mécanisme d'exception horaire (`PARCOURS.md` §4) est un point d'extension naturel.

### 3.5 Le signal « l'enfant est bloqué »

**Question** — qu'est-ce qui déclenche la détection : durée d'inactivité, nombre de
tentatives, formulation de la question, autre ?
**Depuis** — jamais défini.
**Bloque** — la détection de difficulté, qui est l'une des trois fonctions cœur retenues le 20 juin.
**Instruction** — journalise les événements bruts qui permettraient de calculer n'importe
laquelle de ces définitions (voir 3.6). Ne code aucune règle de détection.

### 3.6 Définition calculatoire des signaux comportementaux

**Question** — comment se calculent exactement la persévérance, la régularité, le
help-seeking, le « pic cognitif » ?
**Depuis** — le teardown du 2 août en fait le socle de défendabilité du produit, tout en
notant que **la « détection du pic cognitif » est la revendication la plus fragile
scientifiquement** et qu'elle est à étayer ou à requalifier.
**Bloque** — tout le tableau de bord parent, et le résumé vocal.
**⚠ Urgence particulière** — **un événement non journalisé dès le premier commit est perdu
définitivement.** Contrairement au reste, ça ne se rattrape pas par un refactor : si le
schéma d'événements est incomplet au lancement, les premières semaines de données de la
cohorte de validation sont inexploitables.
**Instruction** — c'est la seule zone où je te demande d'être **proactif plutôt que passif** :
si tu conçois une couche de journalisation, propose un schéma d'événements **large et
horodaté au niveau du tour de conversation**, et fais-le valider. Mieux vaut journaliser trop
que pas assez.

### 3.7 Sécurité de l'échange avec un mineur

**Question** — que fait le coach si l'enfant exprime une détresse, aborde un sujet
inapproprié, ou tente de détourner l'outil ? Quel dispositif de modération, quelle
escalade vers le parent ?
**Depuis** — jamais spécifié. Identifié dans l'audit du 13 août comme bloquant.
**Bloque** — la mise en production, indépendamment de tout le reste.
**Instruction** — prévois dès maintenant la **structure de journalisation des échanges et de
signalement** (`PARCOURS.md` §4, « Journal des échanges » et « Signaler un échange »), même
sans logique de détection. Ne conçois aucune règle de sécurité toi-même.

### 3.8 Référentiel scolaire

**Question** — quel corpus de notions et d'exercices au lancement ?
**Depuis** — CR du 20 juin, action « récupérer les programmes scolaires officiels (Éducation
nationale) » assignée au groupe. Statut inconnu à la date de ce document.
**Bloque** — « génération d'exercices adaptés », l'une des trois fonctions cœur.
**Instruction** — traite le référentiel comme une **donnée externe chargée**, jamais comme du
contenu en dur.

---

# 4 · Données et conformité

### 4.1 Droits du second parent

**Question** — le second parent peut-il consulter, régler, recevoir le résumé ? Comment
exerce-t-il son droit d'opposition ?
**Depuis** — identifié dans l'audit du 13 août. Absent de tous les documents antérieurs.
**Bloque** — le modèle de données, pas seulement un écran.
**Point d'attention** — la CNIL retient l'accord d'un parent, celui de l'autre étant présumé,
mais avec possibilité pour ce second parent de s'y opposer.
**Instruction** — modélise la relation parent ↔ enfant comme **plusieurs-à-plusieurs avec un
rôle**, dès le premier schéma. Un seul champ `parent_id` rendrait l'ajout ultérieur coûteux
en migration. Les droits associés peuvent rester vides pour l'instant.

### 4.2 Durée de rétention des conversations

**Question** — combien de temps conserve-t-on les échanges entre l'enfant et le coach ?
**Depuis** — jamais posé.
**Bloque** — le schéma, la politique de confidentialité, le coût de stockage.
**Instruction** — fais de la rétention un **paramètre du schéma** (date d'expiration portée
par la donnée), pas une constante de code ni une décision implicite « on garde tout ».

### 4.3 Versionnement des consentements

**Question** — pas vraiment une décision ouverte, mais une exigence souvent ratée.
**Bloque** — la capacité à prouver la conformité.
**Instruction** — un consentement est un **enregistrement historisé** (qui, quelle finalité,
quand, quelle version du texte), jamais un booléen sur la fiche de l'enfant. Les trois
finalités sont indépendantes et révocables séparément (`PARCOURS.md` §2, phase 2).

### 4.4 Résiliation d'abonnement

**Question** — articulation entre la résiliation côté magasin d'applications et côté éditeur
en droit français.
**Depuis** — soulevé le 13 août. **Point non vérifié de mon côté** — à faire confirmer par
un conseil.
**Bloque** — l'écran de résiliation.
**Instruction** — n'implémente rien avant l'arbitrage sur 1.4 et cette vérification.

### 4.5 AI Act — situation vérifiée le 16 août 2026

**Ce n'est pas une décision ouverte, c'est une clarification** — le document
`docs/design-review-2026-07-31.md` présente l'AI Act Annexe III comme un risque de calendrier.
C'est inexact depuis le 27 juillet 2026.

**Fait vérifié** — le règlement (UE) 2026/1744 (« omnibus numérique »), publié le 24 juillet
2026 et en vigueur depuis le 27, reporte les obligations des systèmes à haut risque de
l'**Annexe III du 2 août 2026 au 2 décembre 2027**. Ces dates sont explicitement
inconditionnelles : elles ne dépendent plus de la disponibilité des normes harmonisées.
Pour un lancement mi-septembre 2026, l'échéance est à 15 mois.

**S'applique en revanche depuis le 2 août 2026** :
- **Article 50, transparence** — un système d'IA interagissant avec une personne doit se
  signaler comme tel. À rendre explicite et non contournable côté enfant.
- **Article 5, interdictions** — dont l'exploitation des vulnérabilités liées à l'âge pour
  altérer substantiellement le comportement. Le refus des mécaniques d'engagement
  manipulatrices n'est donc pas seulement un positionnement commercial, c'est aussi la zone
  de sécurité réglementaire.

**Reste à faire confirmer par un conseil** — savoir si le produit relève de l'Annexe III. Un
coach socratique qui ne note pas et ne conditionne aucun accès en sort probablement ; les
analytics comportementaux pourraient être plaidés comme une évaluation des acquis. **Je ne
sais pas.** Sans urgence de calendrier.

**Instruction** — ne conçois aucune obligation de haut risque dans le MVP. Assure en revanche
que l'identification de l'IA auprès de l'enfant est présente et non désactivable.

---

# 5 · Ce qui, à l'inverse, est tranché

Pour éviter de rouvrir ce qui est fermé. Ces points sont décidés et documentés :

| Décidé | Où |
| --- | --- |
| **Nom du produit : Nurturia** | Décision du 16 août |
| Application unique avec bascule de mode | Décision du 14 août |
| Verrou par code à 6 chiffres + biométrie conditionnelle | `PARCOURS.md` §3 |
| Authentification par lien magique + code de secours à 6 chiffres | `PARCOURS.md` §2 |
| Consentement : déclaration d'âge + finalités séparées | `PARCOURS.md` §2 |
| React Native / Expo | Décision du 13 août |
| Système de design unifié, deux thèmes | `UI-GUIDELINES.md` §2 |
| Refus des mécaniques compétitives | `CLAUDE.md` §2, teardown du 2 août |
| Le coach ne donne jamais la réponse | CR du 7 mai, principe non négociable |
| Entrée vocale au même rang que le clavier | CR du 20 juin |

---

# 6 · Rappel de calendrier

Objectif de lancement du MVP : **mi-septembre 2026** (CR du 20 juin, pour répondre aux
familles à la rentrée). Les sections 3.1, 3.6 et 3.7 sont sur le chemin critique et ne sont
pas commencées.

---

# 7 · Ouvert par les prototypes du 2 octobre 2026

Les prototypes Claude Design archivés dans `design/prototypes/` supposent plusieurs décisions
qui n'ont pas été prises. Le détail et le contexte sont dans `docs/design-review-2026-10-02.md`
(non autoritatif). **Qu'une mécanique apparaisse dans un prototype ne vaut pas décision.**

### 7.1 Identité visuelle : remplacement de la palette

**Question** — la palette marine/orange et la police Plus Jakarta Sans des prototypes
remplacent-elles le système violet/corail, Nunito et Inter de `UI-GUIDELINES.md` §2, dans les
deux modes ? Ou ne sont-elles qu'une piste ?
**Depuis** — prototypes du 2 octobre. La revue du 31 juillet parlait d'un conflit « assumé »
entre une palette enfant marine et une palette marque violette ; les prototypes abandonnent le
violet aussi côté parent.
**Bloque** — `theme.ts`, `tokens.json`, tous les composants visuels, l'icône d'application.
**Instruction** — **ne modifie pas `theme.ts`.** Ne reprends aucune valeur des prototypes. Si
la palette est validée, elle arrive sous forme de `design/tokens.json`, et `theme.ts` en
devient la transposition (`design/README.md`).

### 7.2 Résumé vocal quotidien ou résumé hebdomadaire

**Question** — le résumé vocal quotidien (`CLAUDE.md` §1, `PARCOURS.md` §4) reste-t-il le
cœur du mode parent ? Les prototypes le remplacent par une notification hebdomadaire et un
tableau de bord.
**Depuis** — prototypes du 2 octobre.
**Bloque** — l'écran « Aujourd'hui » du parent, le pipeline vocal (§2.4), les notifications.
**Instruction** — conserve la note vocale comme ressource asynchrone (§2.4). N'implémente pas
le résumé hebdomadaire avant l'arbitrage.

### 7.3 Tableau de bord parent sur le web

**Question** — le MVP comprend-il un espace parent web, en lecture seule, en plus de l'app ?
**Depuis** — prototype `Nurturia Parent.dc.html`.
**Bloque** — le périmètre MVP, l'authentification web, l'hébergement (§2.1).
**Instruction** — rien côté web. Côté app, garde les données du suivi derrière la couche
`services/`, pour qu'une seconde surface puisse les consommer plus tard.

### 7.4 Modèle d'erreurs récurrentes et règle de résolution

**Question** — le suivi parent repose-t-il sur des erreurs récurrentes (stratégies d'erreur
liées à chaque mauvaise option) avec les statuts active / en cours / résolue ? La règle « 3
réponses correctes sans aide sur au moins 2 jours » est-elle retenue ? Les réponses sont-elles
vérifiées par des règles d'enseignants plutôt que par l'IA ?
**Depuis** — prototypes du 2 octobre. Ces affirmations figurent dans les écrans de transparence
comme des faits.
**Bloque** — §3.6 (signaux), §3.8 (référentiel), §2.2 (architecture du coach), le schéma de
données et tout l'onglet « Erreurs ».
**Instruction** — **ne code aucune règle de résolution ni aucun seuil.** Ne reprends pas les
textes de transparence qui décrivent cette architecture : ils seraient des engagements publics
envers les parents. Journalise les réponses brutes (option choisie, attendue ou non) pour que
n'importe quelle définition reste calculable a posteriori (§3.5).

### 7.5 Frontière de l'invariant n° 1 : exemple résolu et questions libres

**Question** — un exemple entièrement résolu d'un problème voisin, affiché après trois réponses
non attendues, est-il compatible avec « le coach ne donne jamais la réponse » ? Expliquer une
notion en réponse à une question libre (onglet Explorer) l'est-il ? Comment distingue-t-on une
notion d'un exercice ?
**Depuis** — prototypes du 2 octobre. Dans le prototype, la distinction repose sur une
expression régulière.
**Bloque** — §3.1 (contrat pédagogique), §3.4 (blocage total), §3.7 (sécurité, puisque les
questions deviennent ouvertes), l'onglet Explorer entier.
**Instruction** — **n'implémente ni l'exemple résolu ni Explorer.** Ces décisions appartiennent
au contrat pédagogique, qui n'est pas écrit. Signale toute demande qui y toucherait.

### 7.6 Photo de l'énoncé (OCR) et dictée

**Question** — l'enfant peut-il photographier un énoncé imprimé (reconnaissance de texte) et le
dicter (transcription) ? Avec quels fournisseurs, sous quelle finalité de consentement, et
comment prouve-t-on l'effacement de la photo « dès que tu valides » ?
**Depuis** — prototypes du 2 octobre ; la revue du 31 juillet demandait déjà la transience de
l'audio et des photos.
**Bloque** — la saisie d'énoncé, le texte des consentements, l'AIPD, le choix des fournisseurs
(§2.1, §2.2).
**Instruction** — aucune capture photo, aucun envoi d'audio. Si la saisie d'énoncé est codée,
commence par la saisie au clavier, derrière une interface qui accepte d'autres sources.

### 7.7 Accord de l'enfant

**Question** — demande-t-on un accord explicite de l'enfant avant la première session, qui
s'ajoute à celui du parent et bloque l'usage en cas de refus ?
**Depuis** — prototypes du 2 octobre. `PARCOURS.md` §2 ne prévoit que le consentement parent.
**Bloque** — le flux de première bascule en mode enfant, le schéma des consentements.
**Instruction** — modélise les consentements de façon à pouvoir y ajouter un « accord de
l'enfant » versionné (§4.3) sans migration : un accord n'est pas nécessairement donné par un
parent. N'ajoute pas l'écran avant l'arbitrage.

### 7.8 Confiance déclarée avant chaque réponse

**Question** — l'enfant indique-t-il son niveau de confiance (« sûre / je crois / je ne sais
pas ») avant de voir les choix ? Ce signal alimente-t-il une vue parent ?
**Depuis** — prototypes du 2 octobre.
**Bloque** — l'écran de question, la vue « Confiance » côté parent, `EVENEMENTS.md`.
**Instruction** — c'est un événement à journaliser dès le départ s'il est retenu
(`EVENEMENTS.md` §1). Fais valider l'ajout d'un `confidence_declared` dans la spécification
avant de coder l'écran.

### 7.9 « Mon parcours » et la carte des notions

**Question** — la carte des notions étiquetées (« Tu sais faire », « Pas encore exploré »…)
est-elle acceptée côté enfant, ou se rapproche-t-elle trop d'une mécanique de collection
(invariant n° 2) ?
**Depuis** — prototypes du 2 octobre.
**Bloque** — l'onglet « Mon parcours ».
**Instruction** — n'implémente pas la carte. Si l'onglet est demandé, signale le risque avant
de commencer.

### 7.10 Nom du coach et de la mascotte

**Question** — le coach s'appelle-t-il « Néo » ? La mascotte (« Nurtu », fichiers `nurtu-*.svg`)
est-elle le même personnage ou un autre ?
**Depuis** — prototypes du 2 octobre, revue du 31 juillet.
**Bloque** — la microcopie du mode enfant, les assets.
**Instruction** — le nom du coach passe par une clé de traduction (`coach.name`), comme
`app.name`. Ne l'écris jamais en dur.

---

*Nurturia — DECISIONS-OUVERTES.md v0.1 · 14 août 2026 · §7 ajouté le 2 octobre 2026.*
*Chaque décision tranchée sort de ce fichier et entre dans `CLAUDE.md`. Mettre à jour la date.*
