'use strict';

/**
 * Interdit les valeurs numériques d'espacement, de rayon et de hauteur
 * écrites en dur dans un style. Les valeurs autorisées viennent de `space`,
 * `radius`, `componentSize`, `layout` (src/theme/theme.ts).
 *
 * Portée volontairement limitée aux propriétés de style qui correspondent à
 * un rôle du thème (padding, margin, radius, tailles de contrôle...) : on ne
 * flague pas tout nombre littéral du fichier (ça inclurait des index de
 * tableau, des durées d'animation déjà couvertes par `motion`, etc.).
 */

const SPACING_PROPERTIES = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'gap',
  'rowGap',
  'columnGap',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'top',
  'bottom',
  'left',
  'right',
]);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Interdit les nombres littéraux pour les propriétés d'espacement/rayon/taille — utilise space, radius, componentSize ou layout.",
    },
    schema: [],
    messages: {
      rawSpacing:
        'Valeur numérique littérale interdite pour "{{property}}". Utilise un token de space, radius, componentSize ou layout depuis src/theme/theme.ts.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (node.computed) return;
        const keyName = node.key.type === 'Identifier' ? node.key.name : node.key.type === 'Literal' ? String(node.key.value) : null;
        if (keyName === null || !SPACING_PROPERTIES.has(keyName)) return;

        const value = node.value;
        if (value.type === 'Literal' && typeof value.value === 'number') {
          context.report({ node: value, messageId: 'rawSpacing', data: { property: keyName } });
        }
        // Négatif : -8 est un UnaryExpression(-, Literal) dans l'AST.
        if (
          value.type === 'UnaryExpression' &&
          value.operator === '-' &&
          value.argument.type === 'Literal' &&
          typeof value.argument.value === 'number'
        ) {
          context.report({ node: value, messageId: 'rawSpacing', data: { property: keyName } });
        }
      },
    };
  },
};
