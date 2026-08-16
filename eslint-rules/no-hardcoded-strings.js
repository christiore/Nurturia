'use strict';

/**
 * Interdit les chaînes de caractères visibles écrites en dur dans un
 * composant : texte JSX brut, et valeur littérale des props qui portent du
 * texte destiné à l'utilisateur (accessibilityLabel, accessibilityHint,
 * placeholder, label, title, children). Tout doit passer par `t('clé')`
 * depuis `src/i18n` (CLAUDE.md §4 ; définition de « terminé », CLAUDE.md §7).
 *
 * N'est volontairement pas déclenchée par :
 * - les valeurs d'énumération d'accessibilité (`accessibilityRole="button"`) —
 *   ce ne sont pas des props de cette liste ;
 * - `{t('...')}` — l'argument de `t()` est une clé, pas du texte visible, et
 *   n'est de toute façon jamais un enfant JSX direct ni la valeur brute d'un
 *   attribut (il est enveloppé dans un CallExpression).
 */

const TEXT_PROPS = new Set(['accessibilityLabel', 'accessibilityHint', 'placeholder', 'label', 'title']);

function isMeaningful(text) {
  return text.trim().length > 0;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Interdit les chaînes visibles en dur dans un composant — tout passe par src/i18n/fr.json.',
    },
    schema: [],
    messages: {
      hardcodedJsxText: 'Texte JSX en dur "{{text}}". Utilise {t(\'...\')} avec une clé de src/i18n/fr.json.',
      hardcodedProp: 'Valeur en dur "{{text}}" pour la prop "{{prop}}". Utilise {t(\'...\')} avec une clé de src/i18n/fr.json.',
    },
  },
  create(context) {
    return {
      JSXText(node) {
        if (isMeaningful(node.value)) {
          context.report({ node, messageId: 'hardcodedJsxText', data: { text: node.value.trim() } });
        }
      },
      JSXExpressionContainer(node) {
        const expr = node.expression;
        if (expr.type === 'Literal' && typeof expr.value === 'string' && isMeaningful(expr.value)) {
          const parent = node.parent;
          if (parent && parent.type === 'JSXElement') {
            context.report({ node, messageId: 'hardcodedJsxText', data: { text: expr.value.trim() } });
          }
        }
      },
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !TEXT_PROPS.has(node.name.name)) return;
        const value = node.value;
        if (value && value.type === 'Literal' && typeof value.value === 'string' && isMeaningful(value.value)) {
          context.report({
            node: value,
            messageId: 'hardcodedProp',
            data: { text: value.value.trim(), prop: node.name.name },
          });
        }
      },
    };
  },
};
