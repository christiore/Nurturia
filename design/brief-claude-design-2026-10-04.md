# Brief pour Claude Design — itération sur les prototypes Nurturia

*4 octobre 2026. À coller dans Claude Design avec les trois prototypes
(`Nurturia Phone Enfant`, `Nurturia Phone Parent`, `Nurturia Parent`).*

## Contexte en trois lignes

Nurturia est une app mobile unique (React Native) avec deux modes : un **mode enfant**
(CM2-6e, coach IA qui ne donne jamais la réponse) et un **mode parent** (suivi du
comportement face au travail), avec une sortie du mode enfant protégée par un code
parent à 6 chiffres. Aucune mécanique compétitive : pas de série, pas de badge, pas de score.

## Ce qui marche, à garder tel quel

- Le **verrou** : code à 6 chiffres, pause expliquée, biométrie seulement sur l'appareil
  du parent, écran « Tu es toujours en mode Léa » après réouverture.
- La **microcopie** : « C'est bien ça. », « Arrêter pour aujourd'hui », « Cela ne dépend
  pas de ce que Léa a fait », « Un jour sans session n'a rien d'anormal ».
- L'**escalade d'aide** : indice, puis dessin, puis exemple voisin étiqueté « ce n'est pas
  la réponse ».
- Les **états** chargement / vide / erreur / nouveau compte / hors connexion.
- Les consignes photo « Oui : l'énoncé / Non : ta copie ».

## À corriger, par priorité

1. **Chat enfant trop dense.** Sous la conversation s'empilent réponses rapides, champ,
   envoi, « Parler » et « Donne-moi la réponse » : 4 rangées. À 360 pt et texte à 200 %, la
   question du coach disparaît. Proposer **une seule rangée de contrôles par défaut**, le
   micro intégré au champ, et une action « Je suis bloqué·e » qui révèle les options d'aide.
2. **Une couleur, un sens.** L'orange signale à la fois une action (« Passer en mode
   enfant »), le mode enfant (bandeau) et un statut (« erreur active »). Le marine porte à la
   fois le bouton primaire et le statut « en cours ». Séparer les **couleurs d'action** des
   **couleurs de statut**, et le documenter.
3. **Bandeau « Mode Léa » trop dominant.** C'est l'élément le plus vif de chaque écran
   enfant. Il doit rester visible, mais en retrait : fond clair, texte foncé.
4. **Un seul bouton primaire par écran.** L'écran « Aujourd'hui » du parent en a deux
   (bloc marine « Comment ça marche ? » et bouton orange « Passer en mode enfant »).
5. **Contrastes** (WCAG 2.1) :
   - bordure des champs `#DCE2EC` sur blanc : 1,3:1 → il faut ≥ 3:1 ;
   - interrupteur éteint `#C3CAD6` : 1,5:1 → ≥ 3:1 ;
   - chevron `#A7B1C4` : 2,2:1 → ≥ 3:1 ;
   - légende du bloc héro `#DDE7F8` sur `#3A6BB0` : 4,3:1 → ≥ 4,5:1 ;
   - compte à rebours « Renvoyer dans 0:42 » `#7A869C` : 3,7:1 → ≥ 4,5:1.
6. **Texte à 200 %.** Les hauteurs fixes (couloirs de progression, barres de fractions) et
   la grille à deux colonnes de « Mon parcours » ne tiennent pas. Prévoir une colonne
   au-delà de 150 %, et des hauteurs qui grandissent avec le texte.
7. **Tunnel d'entrée enfant** : 4 écrans avant la première question. Proposer un raccourci
   « Reprendre mon devoir de maths » sur l'accueil.

## Contraintes de système à respecter

- **Échelles fermées.** Rayons : 8, 12, 16, 20, 28, 32, pill. Hauteurs de bouton : 40, 48,
  56. Espacements : 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Typographie : 11, 13, 15, 17, 20,
  24, 28, 34. Les prototypes utilisent une dizaine de rayons et une dizaine de hauteurs de
  bouton : à ramener sur ces échelles.
- **Ombres** : trois niveaux seulement (s1, s2, s3), pas de `box-shadow` libre.
- **Cibles tactiles** ≥ 48 pt, écart ≥ 8 pt entre deux cibles.
- **Le rouge** est réservé aux erreurs de saisie et techniques, jamais pour qualifier l'enfant.
- **Vouvoiement** pour le parent, **tutoiement** pour l'enfant, pas de point d'exclamation.
- La microcopie enfant est écrite au féminin pour Léa : prévoir des **tournures neutres**
  (« Je suis sûr·e » ou une reformulation).

## À ne pas trancher dans le design

Ces points sont ouverts côté produit (`DECISIONS-OUVERTES.md` §7). Les présenter comme
**pistes**, pas comme des écrans définitifs : la palette elle-même, le résumé vocal quotidien
(absent des prototypes), le tableau de bord web, le modèle d'erreurs récurrentes et sa règle
de résolution, l'exemple résolu et l'onglet Explorer, la photo d'énoncé et la dictée,
l'accord de l'enfant, la carte des notions, le nom du coach (« Néo » ou « Nurtu »).

## À livrer en plus

- Les **illustrations de la mascotte** `nurtu-01-idle` à `nurtu-09-bienveillance` en SVG
  (elles manquent dans l'export).
- Un **jeu d'icônes** : retour, chevron, micro, envoi, cadenas, coche, information, erreur.
