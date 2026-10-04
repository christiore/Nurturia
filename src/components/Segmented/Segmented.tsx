import React from 'react';
import { Text as RNText, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { fontStyle } from '../../theme/fonts';
import { border, componentSize, typography } from '../../theme/theme';

export type SegmentedOption<T extends string> = { value: T; label: string };

/** 2 à 3 options (UI-GUIDELINES.md §4) — imposé par le type, pas par la revue. */
export type SegmentedOptions<T extends string> =
  | readonly [SegmentedOption<T>, SegmentedOption<T>]
  | readonly [SegmentedOption<T>, SegmentedOption<T>, SegmentedOption<T>];

export type SegmentedProps<T extends string> = {
  /** Ce que le contrôle change, ex. « Période affichée ». */
  accessibilityLabel: string;
  options: SegmentedOptions<T>;
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

/**
 * Change la vue sur les mêmes données (Semaine / Mois). Le conteneur fait 48
 * de haut : c'est lui la cible, chaque segment visuel de 40 voit sa zone
 * étendue par `Pressable` jusqu'à 48.
 */
export function Segmented<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
  testID,
}: SegmentedProps<T>): React.JSX.Element {
  const { theme } = useTheme();
  const size = componentSize.segmented;

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{
        minHeight: size.height,
        padding: size.padding,
        borderRadius: size.radius,
        backgroundColor: theme.colors.surfaceSunken,
        flexDirection: 'row',
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <View key={option.value} style={{ flex: 1 }}>
            <Pressable
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selected, selected }}
            >
              {({ focused }) => (
                <View
                  style={{
                    minHeight: size.itemHeight,
                    borderRadius: size.radius,
                    backgroundColor: selected ? theme.colors.action : 'transparent',
                    borderWidth: focused ? border.focus : 0,
                    borderColor: theme.colors.focusRing,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RNText
                    allowFontScaling
                    numberOfLines={1}
                    style={{
                      ...fontStyle(typography.family.text, typography.bodyStrong.fontWeight),
                      fontSize: typography.label.fontSize,
                      lineHeight: typography.label.lineHeight,
                      color: selected ? theme.colors.actionText : theme.colors.textSecondary,
                    }}
                  >
                    {option.label}
                  </RNText>
                </View>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
