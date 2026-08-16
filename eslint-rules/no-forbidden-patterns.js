'use strict';

const FORBIDDEN_PATTERNS = require('./forbidden-patterns');

/**
 * Interdit les identifiants listés dans FORBIDDEN_PATTERNS (src/theme/theme.ts
 * §5), partout dans src/ — sauf le fichier qui les déclare (voir
 * eslint.config.js) puisqu'il doit forcément contenir les chaînes qu'il
 * dénonce. Ce sont les mécaniques compétitives/culpabilisantes que le
 * positionnement Nurtura refuse (CLAUDE.md §2, invariant produit n°2).
 *
 * Découpage en "mots" plutôt que sous-chaîne brute : un simple `includes()`
 * ferait matcher "xp" dans "expo"/"export", ou "league" dans "colleague".
 * On compare des tokens entiers (frontières camelCase / kebab / snake /
 * espace), pas des fragments de mots.
 */

function splitWords(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 0);
}

const PATTERNS = FORBIDDEN_PATTERNS.map((pattern) => ({
  raw: pattern,
  words: splitWords(pattern),
}));

function containsContiguous(haystack, needle) {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    let matches = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[start + offset] !== needle[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

function findMatch(text) {
  const words = splitWords(text);
  if (words.length === 0) return null;
  return PATTERNS.find((pattern) => containsContiguous(words, pattern.words)) ?? null;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Interdit les identifiants et chaînes listés dans FORBIDDEN_PATTERNS (theme.ts), par mot entier.',
    },
    schema: [],
    messages: {
      forbiddenPattern:
        '"{{text}}" contient le motif interdit "{{pattern}}" (FORBIDDEN_PATTERNS, src/theme/theme.ts) — mécanique compétitive ou culpabilisante refusée par le produit.',
    },
  },
  create(context) {
    function check(node, text) {
      if (!text) return;
      const match = findMatch(text);
      if (match) {
        context.report({ node, messageId: 'forbiddenPattern', data: { text, pattern: match.raw } });
      }
    }

    return {
      Identifier(node) {
        check(node, node.name);
      },
      Literal(node) {
        if (typeof node.value === 'string') {
          check(node, node.value);
        }
      },
      JSXIdentifier(node) {
        check(node, node.name);
      },
      JSXText(node) {
        check(node, node.value);
      },
    };
  },
};
