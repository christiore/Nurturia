/**
 * Copie de `FORBIDDEN_PATTERNS` (src/theme/theme.ts §5). ESLint (flat config,
 * exécuté directement par Node) ne peut pas importer un module `.ts` sans
 * étape de compilation ; la liste est donc dupliquée ici plutôt que lue
 * dynamiquement. `eslint-rules/__tests__/forbidden-patterns.test.ts` échoue
 * si les deux listes divergent — c'est ce test qui tient lieu de source
 * unique de vérité, pas ce fichier.
 */
module.exports = [
  'streak',
  'leaderboard',
  'classement',
  'league',
  'xp',
  'daily-goal-guilt',
  'loss-aversion-notification',
  'countdown-timer-rouge',
  'social-comparison',
];
