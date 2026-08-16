import { FORBIDDEN_PATTERNS } from '../../src/theme/theme';
// eslint-rules/forbidden-patterns.js is CommonJS (ESLint flat config loads it
// directly under Node, no bundler) — import default rather than require().
import eslintForbiddenPatterns from '../forbidden-patterns';

/**
 * ESLint (flat config) ne peut pas importer theme.ts directement — voir le
 * commentaire de eslint-rules/forbidden-patterns.js. Ce test est la garantie
 * que la copie utilisée par la règle ESLint reste synchronisée avec la
 * source de vérité produit (theme.ts §5).
 */
describe('FORBIDDEN_PATTERNS sync', () => {
  it('matches the list duplicated for the ESLint rule', () => {
    expect([...eslintForbiddenPatterns].sort()).toEqual([...FORBIDDEN_PATTERNS].sort());
  });
});
