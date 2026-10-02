import React from 'react';
import { View } from 'react-native';

import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';
import { border, componentSize, layout, space, subject, type SubjectKey } from '../../theme/theme';

/** Écart entre la vignette et le texte. Sert aussi à aligner le séparateur encastré. */
export const LIST_ROW_GAP = space[3];
export const LIST_ROW_PADDING_H = space[4];

/**
 * Point de départ du séparateur encastré : à l'aplomb du texte, jamais bord
 * à bord (UI-GUIDELINES.md §6). La spec cite 78 px ; avec les tokens
 * (16 + 44 + 12) le texte commence à 72 — on aligne sur la position réelle
 * du texte, qui est l'intention de la règle.
 */
export const LIST_ROW_TEXT_INSET = LIST_ROW_PADDING_H + componentSize.listLeading.size + LIST_ROW_GAP;

type ListRowBaseProps = {
  /** Titre, 15/600, tronqué sur une ligne. Déjà traduit. */
  title: string;
  /**
   * Sous-titre de contexte. Décrit l'effort et le contexte, jamais une note :
   * « 14 min · a cherché seule 6 min », pas « 8/10 » (UI-GUIDELINES.md §6).
   */
  subtitle?: string;
  /** Vignette 44 × 44 — voir `ListLeading`. */
  leading?: React.ReactNode;
  testID?: string;
};

export type ListRowProps = ListRowBaseProps &
  (
    | {
        /** Une ligne cliquable ouvre quelque chose : chevron affiché. */
        onPress: () => void;
        /** Ce qui s'ouvre, si le titre ne suffit pas à le dire. */
        accessibilityHint?: string;
        value?: undefined;
      }
    | {
        /** Ligne de données pure : pas de chevron, pas d'appui (UI-GUIDELINES.md §6). */
        onPress?: undefined;
        accessibilityHint?: undefined;
        /** Valeur affichée à droite, ex. « 3 sessions ». */
        value?: string;
      }
  );

export function ListRow({ title, subtitle, leading, onPress, accessibilityHint, value, testID }: ListRowProps): React.JSX.Element {
  const { theme } = useTheme();
  const accessibilityLabel = [title, subtitle, value].filter((part) => part !== undefined).join(', ');

  const content = (focused: boolean): React.JSX.Element => (
    <View
      style={{
        minHeight: subtitle ? layout.listRowTwoLineHeight : layout.listRowMinHeight,
        paddingHorizontal: LIST_ROW_PADDING_H,
        paddingVertical: space[2],
        flexDirection: 'row',
        alignItems: 'center',
        gap: LIST_ROW_GAP,
        borderRadius: theme.radius.field,
        borderWidth: focused ? border.focus : 0,
        borderColor: theme.colors.focusRing,
      }}
    >
      {leading}
      <Box flex={1} gap={1}>
        <Text variant="bodyStrong" color="textPrimary" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {value !== undefined ? (
        <Text variant="label" color="textSecondary">
          {value}
        </Text>
      ) : null}
      {onPress ? <Chevron /> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
      >
        {({ focused }) => content(focused)}
      </Pressable>
    );
  }

  return (
    <View accessible accessibilityLabel={accessibilityLabel} testID={testID}>
      {content(false)}
    </View>
  );
}

/** Vignette 44 × 44, rayon 14, teintée par matière (UI-GUIDELINES.md §6). */
export function ListLeading({ subjectKey, children }: { subjectKey: SubjectKey; children?: React.ReactNode }): React.JSX.Element {
  const size = componentSize.listLeading;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: size.size,
        height: size.size,
        borderRadius: size.radius,
        backgroundColor: subject[subjectKey].tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

/** Chevron dessiné en vues, en attendant le jeu d'icônes (UI-GUIDELINES.md §11). */
function Chevron(): React.JSX.Element {
  const { theme } = useTheme();
  const arm = space[2];
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: arm,
        height: arm,
        borderTopWidth: border.focus,
        borderRightWidth: border.focus,
        borderColor: theme.colors.textMuted,
        transform: [{ rotate: '45deg' }],
        marginRight: space[1],
      }}
    />
  );
}
