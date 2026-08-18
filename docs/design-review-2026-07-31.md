# Revue design & parcours — 31 juillet 2026

## Construit dans le prototype Claude Design (projet 8b4ce3f3-b06e-4e32-b8d5-e8e36328c4c7)

- **B2** : 4e étape ajoutée (préférence voix/écrit), navigation vers B3 conservée.
- **B3 → B5** : B4 (quiz déclaratif) retiré du flux, contenu conservé mais inaccessible
  hors nav de debug (bandeau d'avertissement explicite dans l'écran).
- **D1** : restructuré en 5 états (`défaut → attente → accepté/refusé/timeout`),
  avec boutons de simulation pour tester chaque issue.
- **D1parent** (nouveau, conceptuel) : écran d'approbation côté parent — contexte de
  fréquence ("3e demande cette semaine"), boutons autoriser/refuser.
- **Agoal** (nouveau, conceptuel) : écran de déclaration d'objectif parent (retard /
  confiance / contrôle / entraînement régulier), distinct du curseur d'intensité A4.

Les écrans "parent" (D1parent, Agoal) sont des explorations conceptuelles dans le même
fichier prototype — ils représentent un appareil différent (celui du parent), pas une
suite d'écrans réelle sur le device enfant.


Addendum de décisions à `Nurtura-Parcours-Enfant-MVP-v1.md` (spec source, projet Claude Design).
Ne remplace pas la spec — la complète sur les points challengés en session.

**Note de nommage :** le produit s'appelle **Nurturia**. La spec source et le prototype
disent "Nurtura" partout — coquille cohérente à corriger dans les docs sources.

---

## Décisions actées

### Identité visuelle
- **Palette marque (violet/corail) vs palette enfant (marine/crème/orange) — conflit assumé.**
  La mascotte Nurtu sert de fil rouge visuel commun entre l'app parent et l'app enfant,
  malgré la divergence de palette entre les deux univers.
- **Mascotte — approche en deux temps.** Version simplifiée d'abord : vectorisation propre
  des PNG plats existants, transitions en cut net entre expressions (comme le prototype
  actuel), pas de micro-animation. Pose de base ("idle") à vectoriser et riguer en premier
  (calques séparés : corps, yeux, bouche, antennes). Micro-animations (clignement,
  respiration, transitions 400ms) et pipeline Lottie complet différés après validation du
  concept sur la tranche 2 (socratic loop).

### Résilience réseau & état conversationnel (D4 — hors connexion en session)
- **État conversationnel local-first**, persisté sur disque à chaque transition de tour.
  Scope du store **par profil enfant actif, pas par device** (familles multi-enfants sur
  un même appareil).
- Ce qui doit survivre à un kill de l'app : exercice en cours, historique des tours,
  niveau d'indice atteint, texte tapé non envoyé.
- **Retry silencieux borné** : UI optimiste (message affiché, indicateur "en cours"),
  3 tentatives en backoff exponentiel (~1s / 3s / 7s), puis bannière non bloquante dans
  la conversation — jamais de retour à l'écran D1/D4 d'entrée. Copie enfant : "On est
  déconnectés — ton travail est gardé, on reprend dès que ça revient."
- **Idempotence obligatoire par tour** (clé générée côté client, UUID, attachée avant le
  premier envoi). Le backend doit **cacher la réponse générée** sous cette clé et la
  rejouer telle quelle sur retry — pas seulement dédupliquer l'événement analytique,
  aussi la réponse affichée à l'enfant (sinon deux formulations différentes du même
  indice sur retry).
- **Séparation signal comportemental / bruit réseau** :
  - Temps de réponse mesuré côté client (affichage question → tap envoyer), jamais en
    aller-retour serveur.
  - Flag `network_degraded` sur les tours concernés, exclu de l'analyse de persévérance.
    Une session interrompue par le réseau ne doit jamais s'afficher comme "abandonnée"
    côté parent.
- **Chiffrement au repos** du state local-first (Expo SecureStore pour la clé + store
  chiffré) — conversation d'un enfant sur un téléphone déverrouillé = donnée sensible
  indépendamment du blocage de rétention serveur déjà identifié dans la spec.

### D2 — Blocage persistant
- **Réutilise le même mécanisme que D4** pour la reprise d'un exercice noté "on y
  reviendra" — un seul store local-first sert les deux usages (pas de système de
  reprise séparé à construire).
- Risque non résolu : le signal "difficulté récurrente" remonté au parent (E3) peut être
  pollué si l'escalade de l'aide (voir "Je suis bloqué" ci-dessous) est gamable sans
  tentative réelle — à trancher en même temps que ce point.

### C6 — Progression
- **Pas de régression visible côté enfant.** Cohérence avec I2 (zéro sensation d'échec) >
  exactitude comportementale absolue pour ce public. Régression réservée à la vue parent.

### B4 — Test de profil d'apprentissage (décision révisée)
- **B4 en tant qu'écran de quiz déclaratif est supprimé.** Décision initiale de la
  session ("branché sur le ton") remplacée par une approche plus cohérente avec la
  spec elle-même : *"le vrai profil se construira par observation comportementale sur
  plusieurs semaines, pas par déclaratif"* (déjà écrit dans la spec source, jamais
  appliqué à B4 jusqu'ici).
- **Le premier exercice (B5) devient le capteur.** Réutilise la taxonomie d'événements
  déjà prévue pour C2 (`hint_level_reached`, `attempt_made`, `impulsive_answer_detected`,
  `help_requested`, `time_on_step`). Le profil ne doit **jamais** être inféré à partir
  d'une seule session — accumulation sur plusieurs semaines, cohérent avec la spec.
- **Pas de nouveau trou de transparence** : B3 (pacte de transparence) disclose déjà
  l'observation ("on regarde combien de temps tu passes, sur quoi tu bloques, quand tu
  persévères"), tant qu'il reste avant le premier exercice.
- **Rapport perdu à compenser légèrement** : pour garder le moment "l'app m'écoute" sans
  écran de quiz dédié, plier une question fonctionnelle réelle (pas cosmétique) dans B2
  ou juste avant B5 — ex. "tu préfères parler ou écrire ?", qui sert de vrai réglage de
  modalité pour C1a en même temps.

### Nouveau — objectif parent déclaré (A3/A4)
- **Distinct d'A4 (intensité pédagogique).** A4 règle *comment* Nurtu pousse (curseur de
  difficulté). Le nouvel élément capture *pourquoi* la famille utilise l'app (rattraper
  un retard, consolider la confiance, préparer un contrôle, entraînement régulier) —
  déclaré par le parent, pas par l'enfant. Vit comme extension d'A3, pas un écran séparé.

### A4 — Intensité pédagogique
- **Assumé tel quel.** Réglage parent invisible à l'enfant, tension avec I4 (transparence
  explicite) acceptée sans correctif.

### C0 — Nouvelle entrée "J'ai une évaluation"
- Ajout d'un 3e point d'entrée à côté de "J'ai un devoir" / "Entraîne-moi".
- **Ouvert : à préciser si comportement distinct** (mode révision généraliste, ton
  différent) **ou variante à l'intérieur d'un flux existant.** Se connecte directement
  au nouveau flux de dérogation horaire ci-dessous.

### D1 — Hors plage horaire : nouveau flux de dérogation
- **Le parent peut lever la contrainte horaire à la demande de l'enfant**, en temps réel
  (pas un preset fixe, une approbation ponctuelle par demande).
- **Timeout obligatoire** si le parent ne répond pas (ex. proposé : 5 min), pour respecter
  I7 (zéro écran sans issue) — sinon l'enfant reste bloqué en attente indéfinie.
- **Canal de notification à définir** — push seul risque de ne pas être vu à temps (21h,
  parent occupé) ; fallback SMS à envisager (même logique que le code de liaison en A5).
- **Contexte affiché au parent au moment de la demande** (ex. "3e demande cette semaine")
  pour éviter l'approbation réflexe qui neutraliserait le verrou horaire dans les faits.
- **Scope net-new** : ce flux (demande enfant temps réel + écran d'approbation parent
  temps réel) n'existe dans aucun des 15 écrans déjà prototypés. Noté explicitement comme
  ajout de périmètre, pas glissé silencieusement dans l'existant.

---

## Question stratégique ouverte — fidélisation sans gamification

Posée en session : comment donner envie à l'enfant de revenir, sans reproduire le moteur
de rétention de Duolingo (streaks, notifications de perte, classements) — explicitement
rejeté par I2 et déjà validé comme le bon choix plus tôt dans cette revue.

**Pas de réponse tranchée.** Pistes cohérentes avec I2/I6 à explorer, pas des décisions :
- Continuité relationnelle avec Nurtu (référence aux sessions passées, "la dernière fois
  tu avais buté sur les fractions, comment ça va aujourd'hui ?") plutôt qu'un score
- Satisfaction de maîtrise visible (C6, déjà sans %/classement) comme moteur intrinsèque
- Agentivité de l'enfant : le laisser choisir la notion plutôt que la lui imposer
- Feedback chaleureux suggéré au parent (hors app) plutôt qu'une récompense in-app

**À ne pas faire sans en rediscuter explicitement** : toute mécanique de streak, badge,
notification de relance, ou "reward logic" au sens Duolingo — contredirait I2/I6 déjà
actés dans cette même revue.

## Ouvert — non tranché

1. **"Je suis bloqué" (C2)** — fait monter un barreau de l'escalier d'aide sans exiger de
   tentative réelle. Garde-fou en réflexion, rien de tranché.
2. **D3 (vérification juste/faux)** — confirmé exploitable en boucle par soumissions
   répétées (recherche de la bonne réponse par élimination). Mécanisme de limite pas
   encore défini. Lié au point 1 : les deux affectent la fiabilité du signal remonté au
   parent en D2/E3.
3. **C1a → C1c (reformulation systématique)** — frictionne le tout premier usage (fenêtre
   d'attention ~40s selon la spec). Pas encore challengé en session : à tester contre une
   version où Nurtu démarre directement et se corrige en cours de route si besoin.
4. **A5 (régénération du code de liaison)** — à confirmer que ça ne redémarre pas le flux
   A1-A4 complet.
5. **D5 (matière hors périmètre)** — compteur agrégé anonyme des demandes, potentiellement
   sortable du blocage AIPD général puisque non nominatif. Idée notée, pas actée.

## Sécurité — flags remontés en session, hors périmètre design mais à ne pas perdre

- Rate limiting sur le pairing code (6 chiffres / 24h, brute-forçable sans throttle)
- Modèle de token de session enfant + révocation par le parent (E2)
- Isolation stricte entre familles côté backend (RLS si Supabase — pas la posture par défaut)
- Transience obligatoire de l'audio (C1a) et des photos — jamais stockés, jamais loggués
- Red-teaming de I1 (jailbreak, pas juste insistance) + garde-fous de modération de
  contenu général au-delà du seul refus de donner la réponse
- Aucun SDK tiers de tracking/pub (contrainte catégorie Kids App Store/Play Store)
- Suppression de compte (E2) : cascade réelle sur toutes les données y compris le state
  local-first, révocation immédiate côté appareil, pas un flag "inactif" en base
- **AI Act Annexe III (systèmes à haut risque en éducation)** — la spec ne traite que
  l'art. 50 (transparence). Si le profilage comportemental de Nurturia qualifie comme
  "évaluation des résultats d'apprentissage", les obligations vont bien au-delà de
  l'AIPD (gestion des risques, gouvernance des données, traçabilité, supervision
  humaine, enregistrement UE). Avis juridique spécialisé AI Act à obtenir en urgence,
  potentiellement plus bloquant que l'AIPD sur le calendrier mi-septembre.
- Consentement parental (A2) — "Sign in with Apple" authentifie un compte, pas un lien
  de filiation. Pas de vérification que le signataire est bien le parent.
