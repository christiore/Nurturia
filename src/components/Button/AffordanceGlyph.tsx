import React from 'react';
import { View } from 'react-native';

import { space } from '../../theme/theme';

/**
 * Triangle géométrique (pas un glyphe de police, pas une chaîne) tenant lieu
 * de flèche dans la pastille du bouton « primaire avec affordance ».
 *
 * PLACEHOLDER ASSUMÉ : UI-GUIDELINES.md §11 liste le jeu d'icônes (16
 * pictogrammes 24px) comme « à créer » par la direction artistique — hors
 * périmètre de cette session (CLAUDE.md §5 : « ne les implémente pas »).
 * Le bouton « avec affordance » (§4) dépend pourtant de cette flèche. En
 * attendant l'asset réel, `Button` expose `affordanceIcon` pour la
 * remplacer sans changer son API.
 */
export function AffordanceGlyph({ size, color }: { size: number; color: string }): React.JSX.Element {
  const triangleHeight = size * 0.34;
  const triangleWidth = triangleHeight * 0.85;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        // space[0] === 0 : triangle CSS classique (boîte à taille nulle,
        // bordures colorées sur un seul côté). Zéro reste un token, pas
        // une valeur libre.
        width: space[0],
        height: space[0],
        marginLeft: triangleWidth * 0.15,
        borderTopWidth: triangleHeight / 2,
        borderBottomWidth: triangleHeight / 2,
        borderLeftWidth: triangleWidth,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
      }}
    />
  );
}
