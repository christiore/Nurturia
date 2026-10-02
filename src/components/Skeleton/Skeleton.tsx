import React, { useEffect, useState } from 'react';
import { Animated, View, type DimensionValue } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { componentSize, layout, motion, space, typography } from '../../theme/theme';
import { useReduceMotion } from '../../theme/useReduceMotion';
import { LIST_ROW_GAP, LIST_ROW_PADDING_H } from '../List/ListRow';

export type SkeletonProps = {
  width: DimensionValue;
  height: number;
  /** Rayon : pastille ronde, champ, ou carte. */
  shape?: 'pill' | 'field' | 'circle';
};

/**
 * Bloc d'attente à la forme du contenu — jamais un spinner centré
 * (UI-GUIDELINES.md §6). Pulsation lente, coupée si l'utilisateur a demandé
 * de réduire les animations (invariant n°15). Purement décoratif : c'est le
 * conteneur (`SkeletonGroup`) qui annonce le chargement.
 */
export function Skeleton({ width, height, shape = 'field' }: SkeletonProps): React.JSX.Element {
  const { theme } = useTheme();
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return undefined;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: motion.duration.screen, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: motion.duration.screen, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [reduceMotion, opacity]);

  const borderRadius = shape === 'circle' ? height / 2 : shape === 'pill' ? height / 2 : theme.radius.field;

  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width, height, borderRadius, backgroundColor: theme.colors.surfaceSunken, opacity }}
    />
  );
}

/**
 * Annonce unique « Chargement en cours » pour un ensemble de skeletons, avec
 * `busy` — le lecteur d'écran n'énumère pas chaque bloc gris.
 */
export function SkeletonGroup({
  accessibilityLabel,
  children,
  testID,
}: {
  accessibilityLabel: string;
  children: React.ReactNode;
  testID?: string;
}): React.JSX.Element {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      testID={testID}
    >
      {children}
    </View>
  );
}

/** Squelette d'une `ListRow`, à la même hauteur que la vraie ligne. */
export function ListRowSkeleton({ withLeading = true, twoLines = true }: { withLeading?: boolean; twoLines?: boolean }): React.JSX.Element {
  return (
    <View
      style={{
        minHeight: twoLines ? layout.listRowTwoLineHeight : layout.listRowMinHeight,
        paddingHorizontal: LIST_ROW_PADDING_H,
        flexDirection: 'row',
        alignItems: 'center',
        gap: LIST_ROW_GAP,
      }}
    >
      {withLeading ? (
        <Skeleton width={componentSize.listLeading.size} height={componentSize.listLeading.size} />
      ) : null}
      <View style={{ flex: 1, gap: space[2] }}>
        <Skeleton width="60%" height={typography.bodyStrong.fontSize} shape="pill" />
        {twoLines ? <Skeleton width="40%" height={typography.caption.fontSize} shape="pill" /> : null}
      </View>
    </View>
  );
}
