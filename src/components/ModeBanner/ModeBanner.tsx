import React from 'react';
import { View } from 'react-native';

import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';
import { border, borderInteractive, space } from '../../theme/theme';
import { t } from '../../i18n';

export type ModeBannerProps = {
  childFirstName: string;
  /** Ouvre la saisie du code parent — jamais une sortie directe (invariant n°7). */
  onRequestParent: () => void;
};

/**
 * Rappel permanent du mode enfant, avec l'accès au mode parent derrière le
 * code. Volontairement discret (critique du 4 octobre) : visible sur chaque
 * écran enfant, mais sans dominer la question ou le coach.
 */
export function ModeBanner({ childFirstName, onRequestParent }: ModeBannerProps): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[3],
        paddingLeft: space[4],
        paddingRight: space[1],
        paddingVertical: space[1],
        borderRadius: theme.radius.field,
        backgroundColor: theme.colors.surfaceSunken,
      }}
    >
      <Box flex={1}>
        <Text variant="label" color="textSecondary">
          {t('modeBanner.label', { name: childFirstName })}
        </Text>
      </Box>
      <Pressable
        onPress={onRequestParent}
        accessibilityRole="button"
        accessibilityLabel={t('modeBanner.parentAccessibilityLabel')}
      >
        {({ focused }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              paddingHorizontal: space[3],
              paddingVertical: space[2],
              borderRadius: theme.radius.control,
              borderWidth: focused ? border.focus : border.hairline,
              borderColor: focused ? theme.colors.focusRing : borderInteractive,
            }}
          >
            <LockGlyph />
            <Text variant="label" color="textPrimary">
              {t('modeBanner.parent')}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

/** Cadenas dessiné en vues, en attendant le jeu d'icônes (UI-GUIDELINES.md §11). */
function LockGlyph(): React.JSX.Element {
  const { theme } = useTheme();
  const body = space[3];
  return (
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ alignItems: 'center' }}>
      <View
        style={{
          width: body - space[1],
          height: space[2],
          borderWidth: border.focus,
          borderBottomWidth: 0,
          borderColor: theme.colors.textPrimary,
          borderTopLeftRadius: space[2],
          borderTopRightRadius: space[2],
        }}
      />
      <View style={{ width: body, height: space[2], borderRadius: border.focus, backgroundColor: theme.colors.textPrimary }} />
    </View>
  );
}
