import React, { useCallback, useState } from 'react';
import {
  Animated,
  Pressable as RNPressable,
  type AccessibilityRole,
  type AccessibilityState,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { motion, touch } from '../../theme/theme';
import { useReduceMotion } from '../../theme/useReduceMotion';

type HitSlop = { top: number; bottom: number; left: number; right: number };

/**
 * Complète `measured` jusqu'à la cible tactile minimale (`touch.min`) avec
 * un `hitSlop` symétrique. N'agrandit jamais le visuel — seule la zone
 * d'appui grandit (CLAUDE.md, invariant de code n°11).
 */
export function computeHitSlop(measured: { width: number; height: number } | null): HitSlop | undefined {
  if (measured === null) return undefined;
  const missingWidth = Math.max(0, touch.min - measured.width);
  const missingHeight = Math.max(0, touch.min - measured.height);
  if (missingWidth === 0 && missingHeight === 0) return undefined;
  const horizontal = Math.ceil(missingWidth / 2);
  const vertical = Math.ceil(missingHeight / 2);
  return { top: vertical, bottom: vertical, left: horizontal, right: horizontal };
}

export type PressableRenderState = { pressed: boolean; focused: boolean };

export type PressableProps = {
  /**
   * Comme le `Pressable` natif : soit un noeud fixe, soit une fonction de
   * rendu qui reçoit { pressed, focused } — pour que `Button`/`IconButton`
   * ajustent leur ombre ou leur anneau de focus sans dupliquer le suivi
   * d'état ni l'animation, portés une seule fois ici.
   */
  children: React.ReactNode | ((state: PressableRenderState) => React.ReactNode);
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  /**
   * Toute zone tactile est un élément interactif : `accessibilityLabel` est
   * obligatoire ici (CLAUDE.md, invariant de code n°13, « sans exception »),
   * pas seulement sur les boutons icône.
   */
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  testID?: string;
};

/**
 * L'appui `scale .97` sur 120 ms est intégré ici une seule fois — aucun
 * autre composant ne doit le réimplémenter (PROMPTSESSION1.md §4).
 */
export function Pressable({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityHint,
  accessibilityState,
  testID,
}: PressableProps): React.JSX.Element {
  const reduceMotion = useReduceMotion();
  // useState (pas useRef) : eslint-plugin-react-hooks interdit désormais la
  // lecture de `.current` pendant le rendu (compatibilité React Compiler).
  const [scaleValue] = useState(() => new Animated.Value(1));
  const [measuredSize, setMeasuredSize] = useState<{ width: number; height: number } | null>(null);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMeasuredSize({ width, height });
  }, []);

  const animateTo = useCallback(
    (toValue: number) => {
      if (reduceMotion) return;
      Animated.timing(scaleValue, {
        toValue,
        duration: motion.press.duration,
        useNativeDriver: true,
      }).start();
    },
    [reduceMotion, scaleValue],
  );

  const handlePressIn = useCallback(() => {
    setPressed(true);
    animateTo(motion.press.scale);
  }, [animateTo]);
  const handlePressOut = useCallback(() => {
    setPressed(false);
    animateTo(1);
  }, [animateTo]);
  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <RNPressable
      onLayout={handleLayout}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      hitSlop={computeHitSlop(measuredSize)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled }}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {typeof children === 'function' ? children({ pressed, focused }) : children}
      </Animated.View>
    </RNPressable>
  );
}
