# Nurtura — Parcours parent et audit du manquant

**Version 0.1 · 13 août 2026 · Complète les guidelines UI/UX v0.1**
**Contexte : décision d'une application unique avec bascule de mode**

---

## Avertissements

**Ce document n'est pas un avis juridique.** Il cite des textes et des recommandations publiques
(RGPD, CNIL, directives de revue de l'App Store) parce qu'ils déterminent des écrans et des
parcours. Les points signalés doivent être validés par un conseil avant mise en production. Là où
je ne sais pas, je l'écris.

**Les décisions retenues ici sont celles que tu as validées** : code PIN à 6 chiffres plus
biométrie conditionnelle pour le verrou, lien magique pour l'authentification, déclaration d'âge
plus consentement explicite pour le cadre légal. Elles sont réversibles ; leurs conséquences sont
documentées.

**Les données affichées dans les maquettes sont fictives.** Prénoms, dates, montants : valeurs de
dimensionnement.

---

## 1. Ce que la décision mono-app change vraiment

Passer de deux applications à une seule avec bascule de mode résout un vrai problème — la famille
à un seul appareil — et supprime la friction du double téléchargement. C'est une bonne décision
produit. Mais elle déplace une frontière qui était jusqu'ici garantie par le système
d'exploitation vers **une frontière que nous devons construire nous-mêmes**.

### 1.1 La sécurité devient notre problème

Avec deux applications, un enfant ne pouvait pas atteindre les réglages parentaux : il n'avait pas
l'application. Avec une seule, **tout est à un geste de distance** — ses propres plages horaires,
la température du coach, et surtout les analytics comportementaux le concernant.

Un élève de 6e qui découvre qu'il peut lever ses propres restrictions, c'est la proposition de
valeur qui s'effondre. Et un enfant qui lit « persévérance en baisse » sur son propre compte, c'est
exactement la culpabilisation que le positionnement refuse.

### 1.2 Les règles du magasin d'applications changent

La directive 1.3 des App Review Guidelines d'Apple pose que les applications de la catégorie
Enfants « ne doivent pas inclure de liens sortants, d'opportunités d'achat ou autres distractions
pour les enfants, sauf dans une zone réservée derrière une barrière parentale ». La même directive
interdit en principe les analytics tiers et la publicité tierce, avec des exceptions étroites.

Une application unique contient forcément l'abonnement, les CGU, la politique de confidentialité,
le support. **Ces éléments doivent donc tous vivre côté parent, derrière le code.** Ce n'est pas
un choix d'organisation, c'est une contrainte structurelle.

> **Décision à prendre, que je ne tranche pas :** publier ou non dans la catégorie Enfants.
> Y entrer donne une vitrine et de la crédibilité auprès des parents, au prix de contraintes
> techniques lourdes. Ne pas y entrer — catégorie Éducation, classification 4+ — laisse plus de
> latitude mais prive de ce signal de confiance. Le parcours décrit ici est compatible avec les
> deux, mais l'arbitrage doit être fait **avant** le premier envoi en revue, pas après un rejet.

### 1.3 Le multi-enfant devient une question de navigation

Sur un appareil partagé entre Léa et Tom, « mode enfant » ne suffit plus : il faut **« mode Léa »
ou « mode Tom »**. La bascule est un choix à deux dimensions — quel mode, et pour quel enfant.
Cette question n'existait dans aucun de nos documents.

---

## 2. Le parcours, phase par phase

### Phase 0 — Lancement

Résolution de session avant tout affichage, 400 ms maximum sur l'écran de lancement.

| État | Destination |
| --- | --- |
| Pas de session | Accueil |
| Session valide, mode parent | Aujourd'hui |
| Session valide, mode enfant | Accueil enfant, **verrouillé** |

Le troisième cas est le plus important : si l'application a été fermée en mode enfant, elle
rouvre en mode enfant. Sinon il suffirait de tuer l'application pour sortir du verrou.

### Phase 1 — Entrée par lien magique

**Accueil** → **Saisie e-mail** → **Attente de vérification** → session ouverte.

Trois points d'exécution qui font la différence :

1. **Le code à 6 chiffres est indispensable, pas un bonus.** Le lien magique s'ouvre souvent dans
   un navigateur différent de celui qui a servi à l'inscription, et la session se perd. Sans code
   de secours dans le même e-mail, l'utilisateur est bloqué et abandonne. C'est la panne
   d'onboarding la plus fréquente sur ce type d'authentification.
2. **Renvoi avec délai de 60 secondes** et « changer d'adresse » toujours accessible — la faute
   de frappe dans l'e-mail est le second motif d'abandon.
3. **Props React Native** : `keyboardType="email-address"`, `textContentType="emailAddress"`,
   `autoCapitalize="none"`, `autoComplete="email"` sur le champ ; `textContentType="oneTimeCode"`
   sur le champ de code, pour que iOS le remplisse automatiquement depuis la notification.

L'e-mail sert aussi de **preuve de contact parental** — c'est ce qui rend le consentement
traçable. On l'explique au parent plutôt que de le collecter silencieusement.

### Phase 2 — Onboarding, cinq étapes

| Étape | Écran | Note |
| --- | --- | --- |
| 1 | Votre prénom | Optionnel, sautable |
| 2 | Ajouter un enfant | Prénom, **année de naissance**, classe |
| 3 | **Consentement** | Finalités séparées |
| 4 | Profil d'apprentissage | 4 questions, parent et enfant ensemble |
| 5 | Presets + code parent | Créneau, exigence, puis PIN |

**L'année de naissance n'est pas un détail de personnalisation.** C'est elle qui déclenche le
régime de consentement parental. On l'explique au parent au lieu de la demander sèchement — un
champ dont on comprend l'utilité est un champ qu'on remplit.

**L'écran de consentement** applique trois règles :

- **Finalités séparées, jamais une case unique.** Trois postes : créer le compte (requis),
  recevoir l'analyse du travail (requis, c'est le cœur du service), aider à améliorer le coach
  (**réellement facultatif** — décochable sans dégradation).
- **Mention du second parent.** La CNIL, dans sa recommandation 4, retient le consentement d'un
  seul parent, celui de l'autre étant présumé, mais avec la possibilité pour ce second parent de
  s'y opposer. L'écran le dit explicitement.
- **Révocabilité annoncée dès la collecte** : « vous pouvez retirer chacun de ces accords dans
  Réglages → Données ». Un consentement qu'on ne peut pas retirer aussi facilement qu'il a été
  donné n'est pas un consentement valide.

Le seuil français est de **15 ans** : en dessous, le traitement fondé sur le consentement requiert
l'accord d'un titulaire de l'autorité parentale. Notre cible entrée en 6e (11 ans) est très en
dessous — le régime s'applique dans tous les cas.

### Phase 3 — La bascule

**Feuille de choix de l'enfant** → **écran de transition** (1,5 s) → **mode enfant verrouillé**.

La feuille rappelle le verrou **avant** le basculement : « pour revenir, il faudra saisir votre
code parent ». C'est là que l'information est utile ; après, elle est subie.

L'écran de transition n'est pas cosmétique. Il fait trois choses : signaler sans ambiguïté le
changement d'univers, s'adresser à l'enfant par son prénom, et annoncer que les réglages sont
verrouillés — pour qu'il n'essaie pas.

En mode enfant, un **bandeau permanent** indique « Mode Léa ». Il évite qu'un parent croie être
en mode parent et s'étonne de ne rien pouvoir régler.

### Phase 4 — Le retour

Bouton cadenas discret dans l'en-tête (44 px visuels, `hitSlop` pour atteindre 48) → écran de
saisie du code → Aujourd'hui.

---

## 3. Spécification du verrou

C'est le composant le plus sensible du produit : infranchissable pour un élève de 6e motivé,
invisible pour un parent pressé.

| Règle | Détail | Pourquoi |
| --- | --- | --- |
| **6 chiffres, pas 4** | 10⁶ combinaisons | 10 000 combinaisons se testent à la main ; un million non |
| **Liste noire à la création** | Suites (123456, 654321), répétitions (111111), **date de naissance de l'enfant et du parent** | Ce sont les premiers codes qu'un enfant essaie |
| **Anti-force brute** | 5 essais → 60 s, puis doublement (2 min, 4 min…) | Sans plafond, un enfant patient finit par passer |
| **Délai persistant** | Survit à la fermeture de l'application | Sinon il suffit de la tuer pour réinitialiser le compteur |
| **Biométrie conditionnelle** | Face ID / empreinte **uniquement** si l'appareil est marqué « appareil du parent » | Sur un appareil familial où l'enfant a enregistré son visage, la biométrie ouvrirait le mode parent **à l'enfant** |
| **Récupération** | « Code oublié » → lien magique à l'e-mail du compte | Sans issue, un parent qui oublie son code est enfermé hors de son propre abonnement |
| **Essais restants affichés** | « Encore 2 essais avant une pause d'une minute » | Cacher l'information n'ajoute aucune sécurité et frustre le parent légitime |

Le point sur la biométrie est le plus facile à rater. C'est exactement le cas d'usage qui motive
la décision mono-app — l'appareil familial partagé — qui la rend dangereuse.

### Ce que le verrou protège

Plages horaires et durée · analytics comportementaux · abonnement et paiement · liens sortants,
CGU, support · journal des conversations et signalement.

---

## 4. Arborescence des réglages

Deux niveaux de profondeur maximum depuis la racine.

```
Réglages
├── Enfants
│   └── [Léa]
│       ├── Profil                    prénom, année, classe, avatar
│       ├── Disponibilité             créneaux, jours, durée max
│       │   └── Exceptions            ← AJOUTÉ : rallonge, vacances scolaires
│       ├── Coach                     exigence, seuil du mode strict, matières
│       ├── Ce que je reçois          résumé vocal, heure, alertes
│       ├── Journal des échanges      ← AJOUTÉ : consultation et signalement
│       └── Retirer cet enfant
├── Compte
│   ├── Adresse e-mail
│   ├── Second parent                 ← AJOUTÉ : invitation, droits, opposition
│   ├── Code parent                   modifier, réinitialiser par e-mail
│   └── Appareils connectés           ← AJOUTÉ : marquer « appareil du parent »
├── Abonnement                        ⚠ derrière le code (directive 1.3)
│   ├── Formule et échéance
│   ├── Changer de formule
│   ├── Résilier                      ⚠ aussi simple que la souscription
│   └── Historique de facturation
├── Confidentialité & données
│   ├── Mes accords                   ⚠ révocables un par un
│   ├── Exporter les données          ⚠ portabilité (RGPD art. 20)
│   ├── Supprimer mon compte          ⚠ effacement (art. 17) + exigence App Store
│   ├── Politique de confidentialité
│   └── Conditions d'utilisation
├── Notifications
│   ├── Résumé du soir
│   ├── Demandes de Léa               ← AJOUTÉ
│   └── Rappels hebdomadaires
├── Accessibilité                     ← AJOUTÉ : absent de la v0.1
│   ├── Police lisible
│   ├── Taille du texte
│   └── Réduire les animations
└── Aide
    ├── Comment fonctionne le coach
    ├── Signaler un échange           ← AJOUTÉ : critique
    └── Nous contacter
```

---

## 5. Ce qu'on avait oublié — l'audit

Douze trous, classés par criticité pour un MVP visé mi-septembre. Les quatre premiers bloquent une
mise en production.

### Bloquants

**1 · Le second parent.** Familles séparées, deux foyers : qui reçoit le résumé du soir, qui peut
modifier les réglages, qui paie ? La CNIL retient l'accord d'un parent, l'autre présumé, **mais
avec droit d'opposition du second**. Aucun de nos documents n'aborde le sujet. C'est à la fois un
cas d'usage fréquent, une exigence de conformité et une question de facturation.

**2 · La suppression de compte.** Une application qui permet de créer un compte doit permettre de
le supprimer depuis l'application — exigence App Store, doublée du droit à l'effacement. Un rejet
en revue à une semaine de la rentrée coûterait la fenêtre de lancement.

**3 · L'abonnement et sa résiliation.** Aucun écran de paywall, aucun écran de gestion, aucune
décision sur le moment de présentation ni sur l'existence d'un essai gratuit. Et en France, la
résiliation doit être aussi simple que la souscription. Le CR du 20 juin évoque 9,99 € sans
trancher — l'interface ne peut plus attendre cette décision.

**4 · Le signalement d'un échange.** Une IA générative parle à un mineur. Il faut un chemin de
signalement côté parent *et* côté enfant, plus un journal consultable. Le teardown note que
Sam&Me offre déjà la visualisation des conversations ; nous n'avons rien décidé. Risque
réputationnel, et probablement exigence de modération.

### Haute priorité

**5 · L'exception horaire.** « Contrôle demain, il est 19h05, l'enfant est bloqué. » C'est *le*
scénario du produit — celui que le CR du 7 mai identifie comme le trou dans la cuirasse n°2 — et
il n'avait aucun écran. Sans soupape encadrée (demande de rallonge, une par jour, expirable), le
parent désactive purement et simplement les plages horaires. La promesse de contrôle s'effondre
alors par le milieu, sans qu'aucune métrique ne le signale. J'ai maquetté cet écran (n°12).

**6 · Le jour 0.** Le parent finit l'onboarding un mardi soir ; l'enfant n'a pas encore travaillé.
L'écran « Aujourd'hui » est vide au moment le plus critique pour la rétention. Un état vide
générique ne suffit pas : il faut une vraie première visite qui donne une raison de revenir demain.

**7 · Le multi-enfant.** J'avais mis un sélecteur « Léa / Tom » dans la maquette précédente sans
que ce soit décidé. À trancher : réglages par enfant ou globaux, vue agrégée ou pas, tarification
par enfant ou par famille. Au-delà de trois enfants, le sélecteur segmenté ne tient plus.

**8 · Les états dégradés.** Que voit le parent quand le résumé du soir n'a pas pu être produit ?
Que voit l'enfant sans réseau ? Le CR du 20 juin évoque un « modèle IA local » dont le sens
technique reste à préciser — si c'est embarqué, le hors-ligne change tout ; si c'est du cloud, il
faut des écrans dégradés partout. Je ne sais pas laquelle des deux options a été retenue.

### Priorité moyenne

**9 · Les notifications.** On a le réglage « résumé vocal du soir », pas la stratégie : lesquelles,
à quelle heure, que faire si le parent refuse la permission iOS, et surtout comment relancer
**sans culpabiliser**. Le parti-pris anti-culpabilisation se joue en grande partie ici.

**10 · Les appareils connectés.** Conséquence directe du mono-app : savoir quel appareil est
« l'appareil du parent » (pour autoriser la biométrie) et pouvoir déconnecter un appareil à
distance. La tablette familiale n'est pas le téléphone du parent.

**11 · L'accessibilité en réglages.** La v0.1 prévoit l'option « police lisible » et le respect de
la réduction des animations, mais aucun écran ne les expose. Pour une application scolaire dont
une partie des utilisateurs a des troubles DYS, ce n'est pas un réglage de confort.

### Dette assumée

**12 · La preuve d'âge du parent.** Déclaration plus consentement explicite : proportionné pour un
MVP, tracé, cohérent avec le fait que le parent crée le compte et paie. C'est une dette de
conformité **assumée et documentée**, à réévaluer si le produit grossit ou si le cadre se durcit.

---

## 6. Vérifications effectuées

**Contraste** — 23 paires nouvelles calculées avec la formule WCAG 2.1 : pavé PIN, champ de code,
écran de transition, cases de consentement, nœuds de la carte de parcours, étiquettes de
criticité. Une correction appliquée (étiquette « Requis » passée de `#686F82` à `#565C6E`,
4,36:1 → 5,79:1). **23/23 conformes.**

**Cibles tactiles** — touches du pavé PIN 64 px, cases de code 46 × 58, lignes de réglages 56 px,
boutons primaires 52 px. Les éléments à 44 px (boutons icône) et 40 px (boutons secondaires
courts) atteignent 48 px effectifs via `hitSlop`. **Aucune cible non conforme.**

---

## 7. Prochaines décisions à prendre

Par ordre d'urgence pour tenir mi-septembre :

| Décision | Pourquoi maintenant |
| --- | --- |
| Catégorie Enfants ou Éducation sur l'App Store | Conditionne l'architecture de tout ce qui est derrière le code |
| Prix, essai gratuit, moment du paywall | Trois écrans en dépendent, aucun n'existe |
| Politique multi-enfant : par enfant ou par famille | Conditionne la navigation *et* la facturation |
| Nature du « modèle IA local » | Détermine s'il faut des états hors-ligne partout |
| Droits du second parent | Conditionne le modèle de données, pas seulement l'écran |
| Nom du produit | Toujours ouvert depuis le 7 mai ; bloque l'icône, l'écran de lancement, le dépôt de marque |

---

## Sources

**Documents du projet AIdibou :** CR-Meeting-Cadrage-IAdibou.docx (7 mai 2026) ·
CR-Point-Retroplanning-20juin2026.docx (20 juin 2026) · Wilgo Competitive Teardown and French
EdTech Mapping (2 août 2026).

**Références externes consultées le 13 août 2026 :**

- CNIL, *Recommandation 4 : rechercher le consentement d'un parent pour les mineurs de moins de
  15 ans* — seuil de 15 ans, consentement d'un parent avec l'autre présumé et possibilité
  d'opposition. <https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans>
- CNIL, *Recommandation 1 : encadrer la capacité d'agir des mineurs en ligne*.
  <https://www.cnil.fr/fr/recommandation-1-encadrer-la-capacite-dagir-des-mineurs-en-ligne>
- Apple, *App Review Guidelines*, directives 1.3 (catégorie Enfants, barrière parentale, analytics
  et publicité tiers), 5.1.4 (applications destinées aux enfants), 2.3.6 et 2.3.8 (classification
  d'âge). <https://developer.apple.com/app-store/review/guidelines/>

Le seuil de 15 ans provient de l'article 8 du RGPD tel que transposé en droit français. Les
critères d'accessibilité appliqués sont ceux de WCAG 2.1 niveau AA ; les ratios cités sont
reproductibles à partir des valeurs hexadécimales des tokens.

**Ce que je n'ai pas vérifié :** les modalités exactes de résiliation d'un abonnement souscrit via
l'App Store en droit français, et l'articulation entre la résiliation côté Apple et côté éditeur.
À faire confirmer par un conseil.

---

*Nurtura — Parcours parent et audit v0.1 · 13 août 2026 · Document de travail interne.*
