import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  AccessibilityInfo,
  Pressable as RNPressable,
  type AccessibilityRole,
  type AccessibilityState,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { motion, touch } from '../../theme/theme';

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

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export type PressableProps = {
  children: React.ReactNode;
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

  const handlePressIn = useCallback(() => animateTo(motion.press.scale), [animateTo]);
  const handlePressOut = useCallback(() => animateTo(1), [animateTo]);

  return (
    <RNPressable
      onLayout={handleLayout}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={computeHitSlop(measuredSize)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled }}
      testID={testID}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>{children}</Animated.View>
    </RNPressable>
  );
}
