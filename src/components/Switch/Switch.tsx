import React, { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { border, borderInteractive, componentSize, motion } from '../../theme/theme';
import { useReduceMotion } from '../../theme/useReduceMotion';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Ce que l'interrupteur règle — obligatoire, lu par le lecteur d'écran. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
} & (
  | { disabled?: false; disabledReason?: undefined }
  | { disabled: true; disabledReason: string }
);

const TRACK = componentSize.switchTrack;
const INSET = border.emphasis;
const THUMB = TRACK.height - INSET * 2;
const TRAVEL = TRACK.width - THUMB - INSET * 2;

/**
 * Interrupteur dessiné avec les tokens plutôt que le `Switch` natif, dont la
 * taille et les couleurs varient selon la plateforme. Le visuel fait 52 × 32 ;
 * `Pressable` étend la zone tactile jusqu'à 48 de haut (invariant n°11).
 * L'état « activé » se lit aussi à la position du rond, pas seulement à la
 * couleur (invariant n°18).
 */
export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  disabled,
  disabledReason,
  testID,
}: SwitchProps): React.JSX.Element {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [offset] = useState(() => new Animated.Value(value ? TRAVEL : 0));

  useEffect(() => {
    const target = value ? TRAVEL : 0;
    if (reduceMotion) {
      offset.setValue(target);
      return;
    }
    Animated.timing(offset, {
      toValue: target,
      duration: motion.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [value, reduceMotion, offset]);

  return (
    <Pressable
      onPress={disabled ? undefined : () => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={disabled ? disabledReason : accessibilityHint}
      accessibilityState={{ checked: value }}
      testID={testID}
    >
      {({ focused }) => (
        <View
          style={{
            width: TRACK.width,
            height: TRACK.height,
            borderRadius: TRACK.height / 2,
            padding: INSET,
            backgroundColor: value ? theme.colors.action : borderInteractive,
            borderWidth: focused ? border.focus : 0,
            borderColor: theme.colors.focusRing,
            opacity: disabled ? 0.4 : 1,
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: offset }],
            }}
          />
        </View>
      )}
    </Pressable>
  );
}
