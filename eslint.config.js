const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');

const nurturaRules = require('./eslint-rules');

/**
 * Les quatre règles de garde-fou produit (PROMPTSESSION1.md §3) tournent en
 * pre-commit (.husky/pre-commit) ET en CI (.github/workflows/ci.yml) : une
 * règle qui n'est vérifiée qu'à un seul endroit finit par être contournée.
 */
module.exports = defineConfig([
  {
    ignores: ['dist/**', '.expo/**', 'node_modules/**', 'design/**', 'ios/**', 'android/**'],
  },
  ...expoConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@typescript-eslint': typescriptPlugin },
    rules: {
      // Invariant de code n°9 (CLAUDE.md §3) : any interdit.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Règle 3 : identifiants FORBIDDEN_PATTERNS interdits partout dans src/,
    // SAUF le fichier qui les déclare (il doit forcément les citer).
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/theme/theme.ts', '**/__tests__/**'],
    plugins: { nurtura: nurturaRules },
    rules: {
      'nurtura/no-forbidden-patterns': 'error',
    },
  },
  {
    // Règles 1, 2, 4 : composants d'écran uniquement. theme.ts est la seule
    // source de valeurs brutes (#hex, nombres) ; les tests peuvent utiliser
    // des valeurs arbitraires pour vérifier un comportement.
    files: ['src/screens/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    plugins: { nurtura: nurturaRules },
    rules: {
      'nurtura/no-literal-color': 'error',
      'nurtura/no-raw-spacing': 'error',
      'nurtura/no-hardcoded-strings': 'error',
    },
  },
]);
