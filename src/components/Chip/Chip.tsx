import React from 'react';
import { ScrollView, Text as RNText, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { border, borderInteractive, componentSize, layout, space, typography } from '../../theme/theme';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

/**
 * Filtre de liste. Visuel de 40 de haut, zone tactile étendue à 48 par
 * `Pressable` (UI-GUIDELINES.md §4). L'état sélectionné se lit au fond plein
 * et au contour, pas seulement à la teinte (invariant n°18).
 */
export function Chip({ label, selected, onPress, testID }: ChipProps): React.JSX.Element {
  const { theme } = useTheme();
  const size = componentSize.chip;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="togglebutton"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected, selected }}
      testID={testID}
    >
      {({ focused }) => (
        <View
          style={{
            minHeight: size.height,
            paddingHorizontal: size.paddingH,
            borderRadius: size.radius,
            backgroundColor: selected ? theme.colors.action : theme.colors.surface,
            borderWidth: focused ? border.focus : border.default,
            borderColor: focused ? theme.colors.focusRing : selected ? theme.colors.action : borderInteractive,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText
            allowFontScaling
            numberOfLines={1}
            style={{
              fontFamily: typography.family.text,
              fontSize: typography.label.fontSize,
              lineHeight: typography.label.lineHeight,
              fontWeight: typography.label.fontWeight,
              color: selected ? theme.colors.actionText : theme.colors.textPrimary,
            }}
          >
            {label}
          </RNText>
        </View>
      )}
    </Pressable>
  );
}

export type ChipRowProps = {
  /** Ce que filtrent les chips, ex. « Matière ». */
  accessibilityLabel: string;
  children: React.ReactNode;
  testID?: string;
};

/**
 * Une seule rangée qui défile horizontalement — jamais deux rangées empilées
 * (UI-GUIDELINES.md §4). Le défilement déborde jusqu'aux bords de l'écran
 * pour signaler qu'il y a une suite.
 */
export function ChipRow({ accessibilityLabel, children, testID }: ChipRowProps): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{ marginHorizontal: -layout.screenPaddingH }}
      contentContainerStyle={{
        paddingHorizontal: layout.screenPaddingH,
        paddingVertical: space[1],
        gap: space[2],
        alignItems: 'center',
      }}
    >
      {children}
    </ScrollView>
  );
}
