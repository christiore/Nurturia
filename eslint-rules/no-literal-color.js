'use strict';

/**
 * Interdit toute couleur écrite en dur (#hex, rgb(), rgba(), hsl()) dans un
 * composant. Toute couleur passe par `useTheme().colors` / `palette`
 * (CLAUDE.md, invariant de code n°9).
 */

const HEX_COLOR = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
const FUNCTIONAL_COLOR = /\b(?:rgb|rgba|hsl|hsla)\s*\(/i;

function looksLikeColor(value) {
  return HEX_COLOR.test(value) || FUNCTIONAL_COLOR.test(value);
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Interdit les couleurs littérales (#hex, rgb(), rgba(), hsl()) dans src/screens et src/components.',
    },
    schema: [],
    messages: {
      literalColor:
        'Couleur littérale "{{value}}" interdite ici. Utilise useTheme().colors ou palette depuis src/theme/theme.ts.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && looksLikeColor(node.value)) {
          context.report({ node, messageId: 'literalColor', data: { value: node.value } });
        }
      },
      TemplateElement(node) {
        const raw = node.value && node.value.raw;
        if (typeof raw === 'string' && looksLikeColor(raw)) {
          context.report({ node, messageId: 'literalColor', data: { value: raw } });
        }
      },
    };
  },
};
