# Journal d'événements comportementaux — spécification

**Version 0.1 — proposition à amender · 16 août 2026**
**Résout le point 3.6 de `DECISIONS-OUVERTES.md`**

> Ce document est le **seul** de la série où l'instruction est d'être proactif plutôt que
> d'attendre un arbitrage. Raison : un événement non journalisé au premier commit est perdu
> définitivement. Aucun refactor ne le rattrape.
>
> Il définit **ce qu'on enregistre**, jamais **ce qu'on en conclut**. Les définitions de
> persévérance, régularité et help-seeking restent ouvertes — c'est volontaire, et c'est
> précisément pourquoi il faut enregistrer large dès maintenant.

---

## 1. Sept principes

**1 · On journalise des faits, jamais des interprétations.**
On n'écrit pas `perseverance: 0.7`. On écrit « l'enfant a envoyé un message à T, après 47
secondes sans activité, à sa troisième tentative ». Une métrique se recalcule rétroactivement ;
un fait non enregistré est perdu. Toute valeur calculée dans le journal est un défaut.

**2 · Le grain est le tour de conversation**, pas la session. C'est à ce niveau que vit le
signal comportemental.

**3 · Séparation stricte entre le contenu et le signal.**
Deux flux distincts, avec des politiques de rétention **indépendantes** :

| Flux | Contenu | Rétention |
| --- | --- | --- |
| `conversation` | Le texte des échanges | Courte, paramétrable (point 4.2, ouvert) |
| `events` | Les faits comportementaux, sans texte | Longue |

**C'est le point le plus facile à rater du document.** Si le comportement est journalisé dans
la même table que le texte, purger les conversations détruit rétroactivement les analytics —
c'est-à-dire le cœur de valeur du produit. Les deux flux ne se croisent que par un
identifiant opaque.

**4 · Aucun texte, jamais, dans le flux `events`.**
Ni extrait, ni résumé, ni « premiers mots ». Des longueurs, des durées, des codes. Cette
règle rend le flux d'événements exportable et analysable sans exposer de données d'un mineur.

**5 · Append-only et immuable.** Un événement ne se corrige pas, il s'annule par un
événement compensatoire. `schema_version` sur chaque ligne pour faire évoluer sans casser
l'historique.

**6 · L'horloge du client n'est pas fiable.**
Même problème que le code parent : l'appareil peut avoir une heure fausse, décalée, ou
délibérément modifiée. Chaque événement porte donc :

- `client_ts` — horodatage local à la milliseconde,
- `server_received_ts` — posé à l'ingestion,
- `clock_skew_ms` — l'écart constaté,
- `local_tz` et `local_time` **dénormalisés** — indispensables, parce que reconstituer un
  fuseau historique (changements d'heure compris) des mois plus tard est une source d'erreurs
  silencieuses. Et parce que l'heure locale est la donnée centrale de toute analyse de rythme.

**7 · Hors ligne par défaut.** L'application journalise dans une file locale et rejoue.
Chaque événement porte un `event_id` (UUID généré côté client) et l'ingestion est idempotente.
Un enfant qui travaille dans le métro ne doit pas produire un trou dans les données.

---

## 2. Enveloppe commune

Tous les événements portent ces champs.

| Champ | Type | Note |
| --- | --- | --- |
| `event_id` | UUID | Généré côté client, garantit l'idempotence |
| `schema_version` | int | Version du présent document |
| `event_type` | string | Voir §3 |
| `child_ref` | opaque | Identifiant pseudonyme, jamais un prénom |
| `session_ref` | opaque | Nul hors session |
| `task_ref` | opaque | Nul hors tâche |
| `client_ts` | timestamp ms UTC | Horloge de l'appareil |
| `server_received_ts` | timestamp ms UTC | Posé à l'ingestion |
| `clock_skew_ms` | int | Écart constaté |
| `local_tz` | string IANA | Ex. `Europe/Paris` |
| `local_time` | time | Heure locale dénormalisée |
| `local_dow` | int | Jour de la semaine local |
| `app_version` | string | |
| `device_class` | enum | `phone` \| `tablet` |
| `payload` | objet | Spécifique au type, sans texte |

---

## 3. Les événements

### 3.1 Session

| Type | Charge utile |
| --- | --- |
| `session_started` | `entry_point`, `subject_ref?`, `resumed_from_task_ref?` |
| `session_paused` | `reason` : `backgrounded` \| `call` \| `idle` |
| `session_resumed` | `pause_duration_ms` |
| `session_ended` | `reason` : `completed` \| `window_closed` \| `abandoned` \| `timeout`, `duration_ms`, `active_duration_ms` |

`duration_ms` et `active_duration_ms` sont distincts, et c'est essentiel : une session de
40 minutes dont 30 avec l'appareil posé n'est pas une session de 40 minutes. Sans la pause,
tout indicateur de temps de travail est faux d'un facteur imprévisible.

### 3.2 Tâche

| Type | Charge utile |
| --- | --- |
| `task_started` | `subject_ref`, `notion_ref?`, `origin` : `new` \| `resumed` \| `suggested` |
| `task_ended` | `outcome`, `duration_ms`, `turn_count`, `hint_count`, `attempt_count` |

`outcome` — `resolved_by_child` \| `abandoned` \| `interrupted` \| `window_closed`.
**Il n'existe volontairement pas de valeur `failed`.** Ce n'est pas de la pudeur : le produit
n'évalue pas la justesse, et introduire cette valeur ferait entrer un jugement dans le socle
de données, d'où il ressortirait tôt ou tard dans une interface.

### 3.3 Tour de conversation — le grain porteur

| Type | Charge utile |
| --- | --- |
| `turn_prompted` | `turn_index`, `coach_intent_code?` |
| `child_input_started` | `latency_to_first_input_ms`, `input_mode` : `text` \| `voice` |
| `child_input_submitted` | `composition_duration_ms`, `edit_count`, `length_chars`, `voice_duration_ms?`, `submitted_after_idle_ms` |
| `coach_responded` | `response_type_code`, `generation_latency_ms` |

Le trio **latence avant le premier caractère / durée de composition / nombre de corrections**
est ce qui porte le plus de signal comportemental, et c'est systématiquement ce qu'on oublie
d'enregistrer. Un enfant qui met 40 secondes à commencer puis répond d'un trait n'est pas dans
le même état qu'un enfant qui commence tout de suite et se reprend six fois.

### 3.4 Recours à l'aide

| Type | Charge utile |
| --- | --- |
| `hint_requested` | `requested_by` : `child` \| `coach_offered`, `time_since_task_start_ms`, `time_since_last_hint_ms`, `hint_level` |
| `hint_delivered` | `hint_level` |
| `hint_declined` | `offered_level` |
| `answer_demanded` | `insistence_index`, `time_since_task_start_ms` |
| `answer_refused_by_coach` | `refusal_index` |
| `post_refusal_behaviour` | `outcome` : `continued` \| `abandoned_task` \| `abandoned_session`, `delay_ms` |

Les trois derniers méritent une justification, parce qu'ils sortent du périmètre habituel
d'un journal d'usage.

**Ce sont eux qui testent l'hypothèse n°2 du compte rendu du 7 mai** — « jamais de réponses
sera-t-il perçu comme une promesse ou comme une frustration ? ». Le document pose la question
frontalement et note qu'elle doit se mesurer sur le comportement réel et non sur le déclaratif.
Sans `answer_demanded` et `post_refusal_behaviour`, tu ne pourras pas y répondre autrement
qu'à l'intuition — et c'est le pari le plus risqué du produit.

`hint_declined` — l'enfant refuse une aide proposée — est un signal fort et rarement capté.

### 3.5 Persévérance et décrochage

| Type | Charge utile |
| --- | --- |
| `idle_detected` | `idle_ms`, `context_code` |
| `retry_attempt` | `attempt_index`, `time_since_previous_attempt_ms` |
| `task_abandoned` | `after_ms`, `after_attempts`, `after_hints`, `last_activity_ms` |
| `app_backgrounded` | `during_task` : bool |
| `app_foregrounded` | `away_duration_ms` |

### 3.6 Créneau horaire et exceptions

| Type | Charge utile |
| --- | --- |
| `window_opened` / `window_closed` | `window_ref` |
| `blocked_attempt` | `attempted_at_local_time`, `minutes_from_window` |
| `extension_requested` | `requested_minutes`, `context_task_ref?` |
| `extension_granted` / `extension_denied` | `parent_response_delay_ms` |
| `extension_expired` | `waited_ms` |

`blocked_attempt` révèle **l'écart entre le créneau réglé par le parent et le rythme réel de
l'enfant**. C'est probablement l'indicateur le plus actionnable du produit, et il ne coûte
rien à enregistrer.

### 3.7 Côté parent

| Type | Charge utile |
| --- | --- |
| `voice_note_generated` | `generation_status`, `duration_s` |
| `voice_note_played` | `delay_from_generation_ms`, `played_ratio`, `completed` : bool |
| `insight_viewed` | `insight_code`, `dwell_ms` |
| `setting_changed` | `setting_key`, `from_code`, `to_code` |
| `advanced_settings_opened` | — |
| `onboarding_step_completed` | `step_index`, `duration_ms` |
| `onboarding_abandoned` | `step_index`, `duration_ms` |
| `mode_switched` | `from`, `to`, `unlock_method` : `pin` \| `biometric` |

`voice_note_played` porte **le critère de succès que le teardown du 2 août fixe lui-même** :
plus de 60 % des parents écoutant la note au moins 4 soirs sur 7, faute de quoi le format est
à revoir. Sans `played_ratio` et `delay_from_generation_ms`, ce seuil n'est pas mesurable.

`setting_changed`, `advanced_settings_opened` et le couple onboarding testent l'hypothèse n°3
du 7 mai — le contrôle parental granulaire sera-t-il réellement utilisé, et où les parents
décrochent-ils.

### 3.8 Sécurité et signalement — structure seule

Le point 3.7 de `DECISIONS-OUVERTES.md` n'est pas tranché. On pose la structure, **aucune
logique de détection.**

| Type | Charge utile |
| --- | --- |
| `conversation_flagged` | `flagged_by` : `parent` \| `child` \| `system`, `reason_code?` |
| `safety_signal_raised` | `signal_code`, `severity_code` — réservé, non émis pour l'instant |

---

## 4. Le « pic cognitif » — position honnête

Le teardown du 2 août qualifie cette revendication de **la plus fragile scientifiquement** et
recommande de l'étayer ou de la requalifier.

Ce schéma **ne l'implémente pas et ne le nomme pas**. Il enregistre simplement l'heure locale
et le jour de chaque événement, ce qui permettra, plus tard et avec du volume, de chercher
une corrélation entre moment de la journée et qualité de l'effort. C'est la matière, pas la
conclusion.

Recommandation : ne pas communiquer sur le « pic cognitif » tant qu'une corrélation n'a pas
été observée sur des données réelles.

---

## 5. Ce qu'on ne journalise pas

- **Aucun texte**, sous aucune forme.
- **Aucune métrique dérivée** — elles se recalculent, et une métrique figée dans le journal
  devient fausse dès que sa définition change.
- **Aucun jugement de justesse.** Pas de `correct` / `incorrect` : le produit n'évalue pas.
- **Aucune donnée identifiante directe** dans le flux d'événements. Identifiants opaques
  uniquement.
- **Aucun identifiant publicitaire**, aucun traceur tiers.

---

## 6. Couverture — quelle question, quels événements

C'est la section à relire pour vérifier qu'on n'a rien oublié.

| Question à laquelle il faudra répondre | Événements nécessaires | Origine |
| --- | --- | --- |
| Combien de temps l'enfant cherche-t-il seul ? | `child_input_started`, `hint_requested`, `task_started` | Cœur produit |
| Est-il régulier ? | `session_started` + `local_time` + `local_dow` | Cœur produit |
| Comment demande-t-il de l'aide ? | famille `hint_*` | Cœur produit |
| Persévère-t-il ou décroche-t-il ? | `retry_attempt`, `idle_detected`, `task_abandoned` | Cœur produit |
| « Jamais de réponses » : promesse ou frustration ? | `answer_demanded`, `answer_refused_by_coach`, `post_refusal_behaviour` | Hypothèse 2, CR 7 mai |
| Le contrôle parental est-il réellement utilisé ? | `setting_changed`, `advanced_settings_opened` | Hypothèse 3, CR 7 mai |
| Où les parents décrochent-ils à l'onboarding ? | `onboarding_step_completed`, `onboarding_abandoned` | Hypothèse 3, CR 7 mai |
| La note vocale est-elle écoutée ≥ 4 soirs / 7 ? | `voice_note_generated`, `voice_note_played` | Seuil du teardown, 2 août |
| Le créneau réglé correspond-il au rythme réel ? | `blocked_attempt`, `extension_*` | Audit du 13 août |
| Le verrou est-il contourné ou subi ? | `mode_switched` + échecs de code | Décision mono-app |
| Y a-t-il un moment de la journée plus favorable ? | tout, via `local_time` | À explorer, non revendiqué |

---

## 7. Volume

Estimation : 30 à 60 événements par session, une à deux sessions par jour, soit de l'ordre de
100 événements par enfant et par jour. Sur mille enfants, environ trois millions par mois.
**Ce n'est pas un sujet de coût ni de performance à cette échelle** — l'argument « on
journalise moins pour économiser » ne tient pas, et coûterait bien plus cher plus tard.

---

## 8. Ce que ça implique pour la session de code en cours

Deux choses seulement, et elles ne dépendent d'aucune décision ouverte :

1. **Un module `src/services/events.ts`** exposant `track(eventType, payload)`, une file
   locale persistante, une politique de rejeu idempotent, et l'enveloppe commune du §2. La
   destination reste une implémentation factice tant que le point 2.1 n'est pas tranché.
2. **Les types TypeScript** de tous les événements, générés depuis ce document, avec une
   union discriminée sur `event_type`. Un appel à `track` avec une charge utile non conforme
   doit échouer à la compilation.

Rien d'autre. Aucune métrique, aucun tableau de bord, aucune règle de détection.

---

## 9. Ce que j'attends de toi sur ce document

Ce n'est pas une spécification arrêtée, c'est une proposition à contester. Trois questions :

1. **Manque-t-il un événement** que tu voudrais pouvoir analyser dans six mois ? C'est
   maintenant qu'il faut le dire.
2. **`answer_demanded` et `post_refusal_behaviour` te vont-ils ?** Ils supposent de détecter
   qu'un enfant réclame la réponse — ce qui touchera au contrat pédagogique (point 3.1).
3. **La séparation contenu / signal est-elle acceptable** du point de vue de ce que tu veux
   pouvoir montrer au parent ? Si le parent doit pouvoir relire un échange, la rétention du
   flux `conversation` devient un sujet produit et pas seulement légal.

---

## Sources

- CR-Meeting-Cadrage-IAdibou.docx, 7 mai 2026 — hypothèses 2 et 3, principe « jamais de réponses ».
- CR-Point-Retroplanning-20juin2026.docx, 20 juin 2026 — trois fonctions cœur, entrée vocale.
- Wilgo Competitive Teardown, 2 août 2026 — seuil de validation de la note vocale, fragilité
  scientifique du « pic cognitif ».
- `DECISIONS-OUVERTES.md` §3.6, §3.7, §4.2.

*Nurturia — Schéma d'événements v0.1 · 16 août 2026 · Proposition, à valider.*
