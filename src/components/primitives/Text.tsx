import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

/**
 * Toutes les clés de l'échelle typographique (theme.ts §2), sauf `family`
 * qui n'est pas une variante mais la définition des polices elles-mêmes.
 */
export type TextVariant =
  | 'displayXl'
  | 'displayL'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bodyL'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'micro'
  | 'numberXl'
  | 'numberL';

/**
 * Seules ces variantes utilisent la police de titre du thème actif (Nunito
 * côté enfant, Inter côté parent) — UI-GUIDELINES.md §3.2 : « Inter — toute
 * l'interface, tous les chiffres, tous les titres côté parent. »
 */
const DISPLAY_VARIANTS: ReadonlySet<TextVariant> = new Set(['displayXl', 'displayL', 'h1', 'h2', 'h3']);

export type TextColorRole = keyof ReturnType<typeof useTheme>['theme']['colors'];

export type TextProps = {
  /** Variante de l'échelle typographique. Jamais de taille libre. */
  variant: TextVariant;
  /** Rôle sémantique de couleur — jamais une valeur de palette directe. */
  color?: TextColorRole;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  children: React.ReactNode;
} & Pick<RNTextProps, 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityLiveRegion' | 'testID'>;

export function Text({
  variant,
  color = 'textPrimary',
  align = 'left',
  numberOfLines,
  children,
  ...accessibilityProps
}: TextProps): React.JSX.Element {
  const { theme } = useTheme();
  const scale = typography[variant];
  const fontFamily = DISPLAY_VARIANTS.has(variant) ? theme.displayFamily : typography.family.text;

  const style: TextStyle = {
    fontFamily,
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    fontWeight: scale.fontWeight,
    letterSpacing: scale.letterSpacing,
    color: theme.colors[color],
    textAlign: align,
  };
  if ('fontVariant' in scale) {
    style.fontVariant = [...scale.fontVariant];
  }

  return (
    <RNText
      allowFontScaling
      numberOfLines={numberOfLines}
      style={style}
      {...accessibilityProps}
    >
      {children}
    </RNText>
  );
}
