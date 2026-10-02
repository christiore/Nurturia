# Références visuelles — NE PAS LIRE COMME SOURCE

Les deux fichiers HTML de ce dossier sont des **maquettes à ouvrir dans un navigateur**.

Leur CSS est un rendu web. Le transposer en React Native produirait :
- des ombres cassées sur Android (`box-shadow` n'a pas d'équivalent direct),
- des valeurs hors tokens.

Toute valeur nécessaire au code se trouve dans `src/theme/theme.ts` ou dans
`docs/UI-GUIDELINES.md`. Jamais ici.

`tokens.json` est la source de vérité des tokens, agnostique de plateforme.
`src/theme/theme.ts` en est la transposition typée : c'est ce que consomme le code.

> `tokens.json` n'a pas encore été livré dans ce dossier — seul `theme.ts` a été fourni à la
> session 1 des fondations. Ne le régénère pas depuis `theme.ts` : c'est `tokens.json` qui
> devrait être la source, `theme.ts` sa transposition, jamais l'inverse.

## Prototypes cliquables

`design/prototypes/` contient les prototypes Claude Design reçus le 2 octobre 2026 (mode enfant,
mode parent, tableau de bord web). Même statut que les maquettes ci-dessus : à ouvrir, pas à lire.
Ils utilisent une palette qui n'est **pas** celle de `theme.ts` : voir `DECISIONS-OUVERTES.md` §7.1
et `docs/design-review-2026-10-02.md`.
