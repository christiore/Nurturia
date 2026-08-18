# Nurturia — Instructions projet

> Fichier lu à chaque session. Il porte les règles du projet, pas sa documentation.
> Les specs détaillées vivent dans `/docs`. Ici, seulement ce qui ne se négocie pas.
>
> Version 0.1 — 14 août 2026. Les sections marquées **`À COMPLÉTER`** dépendent de
> décisions non encore prises : ne les remplis pas toi-même, demande.

---

## 1. Le produit en cinq lignes

Application mobile **React Native / Expo**. Un compte parent, un ou plusieurs enfants.
**Une seule application** qui bascule entre un mode parent et un mode enfant, la sortie du
mode enfant étant protégée par un code à 6 chiffres.

- **Mode enfant** — un coach IA qui accompagne le travail scolaire et **ne donne jamais la réponse**.
- **Mode parent** — suivi comportemental (persévérance, régularité, recours à l'aide) et un résumé vocal quotidien.

Le produit **refuse explicitement les mécaniques d'engagement compétitives**. Ce n'est pas une
préférence esthétique, c'est le positionnement commercial et le socle de différenciation.

> **Nom : « Nurturia », arrêté le 16 août 2026.** C'est le nom du produit partout — dépôt,
> identifiant de bundle, documentation, interface.
>
> La règle d'écriture ne change pas pour autant : **ne l'écris jamais en dur dans une chaîne
> affichée.** Tout libellé visible passe par `i18n/fr.json`, clé `app.name`, et l'identifiant
> de marque dans le thème reste `brand` / `primary`, jamais le nom du produit. Deux raisons :
> la localisation, et le fait que la recherche d'antériorité au registre des marques n'a pas
> encore été faite — voir `DECISIONS-OUVERTES.md` §1.1. Si elle revenait défavorable, un
> renommage doit rester un changement de clé de traduction et d'asset, pas un refactor.

---

## 2. Invariants produit — ne jamais enfreindre

Ces règles priment sur toute autre considération. Si une demande semble les contredire,
**arrête-toi et demande** plutôt que d'arbitrer.

1. **Le coach ne donne jamais la réponse.** Il questionne, oriente, décompose. Cette règle
   est le produit ; toute implémentation qui la contourne est un bug, pas un raccourci.
2. **Aucune mécanique compétitive ou culpabilisante.** Interdits : séries de jours
   consécutifs, classements, comparaison entre enfants, XP, badges, boutique, tirages,
   notifications à aversion pour la perte. La constante `FORBIDDEN_PATTERNS` de `theme.ts`
   en liste les identifiants : s'ils apparaissent dans une PR, c'est un défaut produit.
3. **Le rouge est réservé aux erreurs techniques et de saisie.** Jamais pour qualifier la
   performance ou le comportement de l'enfant. Il n'existe volontairement aucun token
   `colorBad` ou `colorFail` — ne les crée pas.
4. **Aucun score global n'est montré à l'enfant.** Les analytics comportementaux sont un
   livrable destiné au parent.
5. **La comparaison se fait avec l'enfant lui-même**, sur une période antérieure. Jamais avec
   d'autres enfants, jamais avec une moyenne.
6. **Un jour sans session n'est pas un échec.** Ni dans l'interface, ni dans les graphiques,
   ni dans la microcopie.
7. **Le mode enfant est verrouillé.** Sa sortie exige le code parent. L'application rouvre
   dans le mode où elle a été fermée — tuer l'application ne doit jamais faire sauter le verrou.
8. **Tout ce qui est achat, lien sortant, CGU, politique de confidentialité et support vit
   côté parent, derrière le code.** Contrainte de revue App Store, directive 1.3.

---

## 3. Invariants de code — ne jamais enfreindre

9. **Aucune valeur brute dans un composant.** Pas de `#hex`, pas de padding en dur, pas de
   rayon en dur. Tout passe par `useTheme()` et les constantes de `theme.ts`. Une règle de
   lint doit le vérifier ; si elle n'existe pas encore, crée-la.
10. **Un composant ne connaît pas son thème.** Il consomme les rôles (`colors.action`,
    `colors.textSecondary`), jamais les primitives (`palette.primary[600]`).
11. **Toute zone tactile fait au moins 48 × 48.** Si le visuel est plus petit, étends avec
    `hitSlop` — n'agrandis jamais l'icône pour compenser. Écart minimum de 8 entre deux cibles.
12. **Toute liste implémente ses quatre états** : chargement (skeletons, pas de spinner
    centré), vide, erreur, plein. Une liste sans ses quatre états n'est pas terminée.
13. **Tout élément interactif porte `accessibilityLabel`, `accessibilityRole` et
    `accessibilityState`.** Sans exception pour les boutons icône.
14. **`allowFontScaling` reste actif** et chaque écran doit tenir à 200 % de taille de police.
15. **`AccessibilityInfo.isReduceMotionEnabled` est respecté** partout où il y a une animation.
16. **Un seul bouton primaire visible par écran.**
17. **Toute action destructrice est annulable** (toast de 5 s) ou confirmée dans une feuille.
18. **Contraste** : texte ≥ 4,5:1, éléments d'interface ≥ 3:1. La couleur ne porte jamais
    seule une information.
19. **Ombres** : toujours fournir les propriétés iOS *et* `elevation` Android. Les valeurs
    viennent de `shadow.s1/s2/s3` — ne transpose jamais un `box-shadow` CSS depuis les
    maquettes HTML.

---

## 4. Ton et microcopie

Le positionnement anti-culpabilisation se joue autant dans les mots que dans les pixels.

- **Constat au passé, proposition au présent.** « Hier, tu as tenu 12 minutes sur les
  fractions. Tu veux reprendre où tu t'es arrêtée ? »
- **Pas de point d'exclamation** dans les messages système — il transforme une information
  en injonction.
- **Pas d'impératif culpabilisant** : ni « Ne casse pas », ni « Tu dois », ni « Il te reste ».
- **Pas de vocabulaire d'échec** adressé à l'enfant : ni « raté », ni « erreur », ni « échec ».
- **Un message d'attention constate et normalise** : « Pas de session depuis 4 jours. C'est
  fréquent en période de vacances. »
- **Vouvoiement pour le parent, tutoiement pour l'enfant.**
- **Un message d'erreur dit quoi faire, pas ce qui est faux** : « Choisissez une classe pour
  adapter les exercices », pas « Champ obligatoire ».

Toute chaîne visible passe par les fichiers de traduction (`fr` seule langue au lancement).
Aucune chaîne en dur dans un composant.

---

## 5. Où vivent les choses

```
/src/theme/theme.ts          Tokens typés — PREMIER fichier du projet, tout s'y branche
/design/tokens.json          Source de vérité des tokens, agnostique de plateforme
/design/*.html               Maquettes de référence — NE PAS LIRE (voir avertissement)
/docs/UI-GUIDELINES.md       Specs des composants
/docs/PARCOURS.md            Parcours d'authentification, verrou, arborescence des réglages
/DECISIONS-OUVERTES.md       Ce qui n'est pas tranché — à lire avant toute hypothèse
```

> **Avertissement sur les fichiers HTML.** Les deux maquettes (`nurturia-styleguide.html`,
> `nurturia-parcours-parent.html`) sont des **références visuelles à ouvrir dans un
> navigateur**, pas des sources à lire. Leur CSS est un rendu web : le transposer produirait
> des ombres cassées sur Android et des valeurs hors tokens. Si tu as besoin d'une valeur,
> elle est dans `theme.ts` ou dans les guidelines — jamais dans le HTML.

### Ce qui fait foi dans les guidelines

- `UI-GUIDELINES.md` — **sections 3 à 10 font foi** (fondations, boutons, formulaires,
  listes, navigation, cartes et data viz, accessibilité, ton et microcopie). Les sections 1
  et 2 sont du contexte utile mais non normatif. Les sections 11 et 12 s'adressent à la
  direction artistique et à l'équipe : **ne les implémente pas.**
- `PARCOURS.md` — **sections 2, 3 et 4 font foi** (parcours phase par phase, spécification du
  verrou, arborescence des réglages). Les sections 1, 5, 6 et 7 sont du contexte, un audit et
  des alertes destinés à l'équipe : elles décrivent des manques et des décisions à prendre,
  pas des specs. **N'implémente rien à partir de la section 5.**

> Ces deux fichiers viennent de `NURTURIA-UI-GUIDELINES.md` et
> `NURTURIA-PARCOURS-ET-AUDIT.md`. Renomme-les en `UI-GUIDELINES.md` et `PARCOURS.md` en les
> plaçant dans `/docs`, ou corrige les chemins ci-dessus.

---

## 6. Le verrou de mode enfant — points d'implémentation

Composant le plus sensible du produit. Spécification complète dans `PARCOURS.md` §3.
Les cinq points qu'on rate habituellement :

- **Code à 6 chiffres**, pas 4.
- **Liste noire à la création** : suites, répétitions, et **les dates de naissance de l'enfant
  et du parent** — ce sont les premiers codes qu'un enfant essaie.
- **Le délai anti-force brute persiste à la fermeture de l'application.** Sinon il suffit de
  la relancer pour réinitialiser le compteur.
- **La biométrie est conditionnelle** : elle ne déverrouille que si l'appareil est marqué
  « appareil du parent ». Sur un appareil familial où l'enfant a enregistré son visage, la
  biométrie ouvrirait le mode parent *à l'enfant*.
- **« Code oublié » doit exister** et passer par un lien envoyé à l'e-mail du compte.

---

## 7. Définition de « terminé »

Un écran ou un composant n'est pas terminé tant que les huit points suivants ne sont pas vrais :

- [ ] Aucune valeur hors `theme.ts`
- [ ] Les quatre états sont implémentés (chargement, vide, erreur, plein) si l'écran affiche une liste
- [ ] Toutes les cibles tactiles atteignent 48 px, `hitSlop` compris
- [ ] Attributs d'accessibilité posés sur tous les éléments interactifs
- [ ] L'écran tient à 200 % de taille de police
- [ ] Les animations respectent la réduction de mouvement
- [ ] Aucune chaîne en dur — tout passe par les traductions
- [ ] La microcopie respecte les règles de la section 4

---

## 8. Ce qu'il faut demander plutôt que décider

`DECISIONS-OUVERTES.md` liste les questions non tranchées. **Consulte-le avant de faire une
hypothèse structurante.** Si ta tâche touche l'un de ces sujets :

1. Arrête-toi.
2. Implémente ce qui est indépendant de la décision.
3. Pose la question explicitement, en indiquant ce que tu ferais par défaut et pourquoi.

Ne comble pas un vide par un choix plausible. Un choix plausible non signalé est plus coûteux
qu'un blocage signalé — il ne se découvre qu'en revue, parfois des semaines plus tard.

---

## 9. `À COMPLÉTER` — dépend de décisions non prises

Ne remplis pas ces sections de ta propre initiative.

### Stack et architecture
`À COMPLÉTER` — backend, hébergement, résidence des données, fournisseur d'authentification,
stockage des fichiers audio. Voir `DECISIONS-OUVERTES.md` §2.

### Modèle de données
`À COMPLÉTER` — dépend du backend. Trois contraintes déjà connues et à respecter dès le
premier schéma, parce qu'elles ne se rajoutent pas sans migration :

- La relation parent ↔ enfant est **plusieurs-à-plusieurs** (second parent), pas une colonne.
- Les consentements sont **historisés et versionnés** (qui, quoi, quand), pas des booléens.
- La durée de rétention des conversations doit être un paramètre du schéma, pas une constante.

### Coach IA
`À COMPLÉTER` — prompt système, règle de bascule vers le mode strict, effet concret de la
« température », comportement en cas de blocage total, jeu de tests de référence.
**N'écris aucun prompt de coach tant que ce document n'existe pas.** Voir `DECISIONS-OUVERTES.md` §3.

### Signaux comportementaux
`À COMPLÉTER` — définition calculatoire de chaque signal et liste des événements à journaliser.
**Point le plus urgent du projet** : un événement non journalisé dès le premier commit est
perdu définitivement. Voir `DECISIONS-OUVERTES.md` §3.

### Structure de dossiers

Confirmée à la session 1 (fondations) :

```
src/
  theme/          theme.ts, ThemeProvider, useTheme
  components/     primitives (Text, Box, Pressable) puis composants du système
  screens/        un dossier par écran, colocalisé avec ses états
  navigation/     routeur, gestion des modes parent / enfant
  features/       logique métier par domaine (auth, coach, insights, settings)
  services/       accès réseau, stockage, notifications
  i18n/           fr.json
```

### Tests
`À COMPLÉTER` — stratégie et outillage définitifs. Point de départ posé à la session 1 :
Jest + `jest-expo` + `@testing-library/react-native`. Deux exigences déjà fermes, quelle que
soit la stratégie retenue : le verrou de mode enfant et le respect du principe « le coach ne
donne jamais la réponse » doivent être couverts par des tests automatisés, pas par de la
revue manuelle.

---

## 10. Conventions de travail

- **Langue** : code et commentaires en anglais, interface et documentation en français.
- **Commits** : un commit par unité cohérente. Message en français, à l'impératif.
- **Avant de proposer une dépendance** : vérifie qu'elle est compatible Expo sans éjection.
- **Quand tu ne sais pas** : dis-le. Ne produis pas une implémentation plausible en espérant
  qu'elle passe.

---

*Nurturia — CLAUDE.md v0.1 · 14 août 2026 · À mettre à jour à chaque décision tranchée.*
