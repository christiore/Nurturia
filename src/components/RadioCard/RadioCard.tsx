import React from 'react';
import { View } from 'react-native';

import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';
import { border, borderInteractive, layout, space } from '../../theme/theme';

export type RadioOption<T extends string> = {
  value: T;
  /** Libellé déjà traduit. */
  label: string;
  /** Précision facultative, ex. « 17h – 19h ». */
  description?: string;
};

export type RadioCardGroupProps<T extends string> = {
  /** Question posée, lue comme nom du groupe par le lecteur d'écran. */
  accessibilityLabel: string;
  options: readonly RadioOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  testID?: string;
};

/**
 * Cartes tactiles plutôt que boutons radio (UI-GUIDELINES.md §5, règle n°4) :
 * un radio natif fait 20 px, ici toute la carte de 64 px est la cible.
 * Les deux premières options sont censées être des presets nommés,
 * « Personnaliser » en troisième (règle n°3) — c'est à l'écran de l'ordonner.
 */
export function RadioCardGroup<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
  testID,
}: RadioCardGroupProps<T>): React.JSX.Element {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} testID={testID}>
      <Box gap={3}>
        {options.map((option) => (
          <RadioCard
            key={option.value}
            option={option}
            selected={option.value === value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </Box>
    </View>
  );
}

function RadioCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: RadioOption<T>;
  selected: boolean;
  onSelect: () => void;
}): React.JSX.Element {
  const { theme } = useTheme();
  const indicatorSize = space[5];

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityLabel={option.description ? `${option.label}, ${option.description}` : option.label}
      accessibilityState={{ checked: selected, selected }}
    >
      {({ focused }) => (
        <View
          style={{
            minHeight: layout.listRowMinHeight,
            paddingHorizontal: space[4],
            paddingVertical: space[3],
            borderRadius: theme.radius.field,
            backgroundColor: theme.colors.surface,
            // La sélection ne repose pas que sur la couleur : l'épaisseur du
            // bord et la pastille pleine changent aussi (invariant n°18).
            borderWidth: selected || focused ? border.focus : border.default,
            borderColor: focused ? theme.colors.focusRing : selected ? theme.colors.action : borderInteractive,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space[3],
          }}
        >
          <View
            style={{
              width: indicatorSize,
              height: indicatorSize,
              borderRadius: indicatorSize / 2,
              borderWidth: border.focus,
              borderColor: selected ? theme.colors.action : borderInteractive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected ? (
              <View
                style={{
                  width: indicatorSize / 2,
                  height: indicatorSize / 2,
                  borderRadius: indicatorSize / 4,
                  backgroundColor: theme.colors.action,
                }}
              />
            ) : null}
          </View>
          <Box flex={1} gap={1}>
            <Text variant="bodyStrong" color="textPrimary">
              {option.label}
            </Text>
            {option.description ? (
              <Text variant="caption" color="textSecondary">
                {option.description}
              </Text>
            ) : null}
          </Box>
        </View>
      )}
    </Pressable>
  );
}
