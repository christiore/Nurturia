import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { border, componentSize } from '../../theme/theme';
import { resolveShadow, resolveVariantColors, type IconButtonVariant } from './variants';

export type IconButtonSize = keyof typeof componentSize.iconButton;

type IconButtonCommonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  /**
   * Jamais optionnel : un bouton icône sans libellé accessible est
   * invisible pour un lecteur d'écran (UI-GUIDELINES.md §4, CLAUDE.md
   * invariant de code n°13 — « sans exception pour les boutons icône »).
   */
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
};

export type IconButtonProps = IconButtonCommonProps &
  (
    | { disabled?: false; disabledReason?: undefined }
    | { disabled: true; disabledReason: string }
  );

export function IconButton({
  icon,
  onPress,
  variant = 'secondary',
  size = 'md',
  disabled,
  disabledReason,
  loading,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: IconButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const colors = resolveVariantColors(theme, variant);
  const dimension = componentSize.iconButton[size];
  const isInert = disabled || loading;

  return (
    <Pressable
      onPress={isInert ? undefined : onPress}
      disabled={isInert}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={disabled ? disabledReason : accessibilityHint}
      accessibilityState={{ disabled: isInert, busy: loading }}
      testID={testID}
    >
      {({ pressed, focused }) => (
        <View
          style={{
            width: dimension,
            height: dimension,
            borderRadius: theme.radius.control,
            backgroundColor: colors.background,
            borderColor: focused ? theme.colors.focusRing : colors.borderColor,
            borderWidth: focused ? border.focus : colors.borderWidth,
            opacity: disabled ? 0.4 : 1,
            alignItems: 'center',
            justifyContent: 'center',
            ...resolveShadow(pressed, isInert),
          }}
        >
          {loading ? <ActivityIndicator color={colors.content} size="small" /> : icon}
        </View>
      )}
    </Pressable>
  );
}
