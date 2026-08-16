import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text as RNText, type LayoutChangeEvent, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { border, componentSize, typography } from '../../theme/theme';
import { AffordanceGlyph } from './AffordanceGlyph';
import { resolveShadow, resolveVariantColors, type ButtonVariant } from './variants';

export type { ButtonVariant };
export type ButtonSize = keyof typeof componentSize.button;

type ButtonCommonProps = {
  /** Libellé visible — déjà traduit par l'appelant via t(). */
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Remplace le triangle placeholder par l'icône réelle une fois livrée (voir AffordanceGlyph.tsx). */
  affordanceIcon?: React.ReactNode;
  /** Par défaut, le libellé sert de nom accessible. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export type ButtonProps = ButtonCommonProps &
  (
    | { disabled?: false; disabledReason?: undefined }
    // Désactivé "avec un texte qui explique pourquoi" (UI-GUIDELINES.md §4)
    // — impossible à l'appelant d'oublier disabledReason, imposé par le type.
    | { disabled: true; disabledReason: string }
  );

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  disabledReason,
  loading,
  affordanceIcon,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const colors = resolveVariantColors(theme, variant);
  const dimensions = componentSize.button[size];
  const [lockedWidth, setLockedWidth] = useState<number | undefined>(undefined);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!loading) {
        setLockedWidth(event.nativeEvent.layout.width);
      }
    },
    [loading],
  );

  const resolvedHint = disabled ? disabledReason : accessibilityHint;
  const isInert = disabled || loading;

  return (
    <Pressable
      onPress={isInert ? undefined : onPress}
      disabled={isInert}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={resolvedHint}
      accessibilityState={{ disabled: isInert, busy: loading }}
      testID={testID}
    >
      {({ pressed, focused }) => (
        <View
          onLayout={handleLayout}
          style={{
            height: dimensions.height,
            width: loading ? lockedWidth : undefined,
            paddingHorizontal: dimensions.paddingH,
            borderRadius: theme.radius.control,
            backgroundColor: colors.background,
            borderColor: focused ? theme.colors.focusRing : colors.borderColor,
            borderWidth: focused ? border.focus : colors.borderWidth,
            opacity: disabled ? 0.4 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: dimensions.gap,
            ...resolveShadow(pressed, isInert),
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.content} size="small" />
          ) : (
            <>
              <RNText
                allowFontScaling
                numberOfLines={1}
                style={{
                  fontFamily: typography.family.text,
                  fontSize: dimensions.fontSize,
                  fontWeight: typography.bodyStrong.fontWeight,
                  color: colors.content,
                }}
              >
                {label}
              </RNText>
              {variant === 'primaryWithAffordance'
                ? (affordanceIcon ?? (
                    <AffordancePastille
                      size={componentSize.iconButton[size]}
                      background={colors.content}
                      foreground={colors.background}
                    />
                  ))
                : null}
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

function AffordancePastille({
  size,
  background,
  foreground,
}: {
  size: number;
  background: string;
  foreground: string;
}): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AffordanceGlyph size={size} color={foreground} />
    </View>
  );
}
