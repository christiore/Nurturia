import React from 'react';
import { Text as RNText, View } from 'react-native';

import { Pressable } from '../primitives/Pressable';
import { useTheme } from '../../theme/ThemeProvider';
import { fontStyle } from '../../theme/fonts';
import { border, componentSize, space, typography } from '../../theme/theme';
import { t } from '../../i18n';

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

const KEY_SIZE = componentSize.iconButton.lg;
const ZERO = '0';
/** Glyphe d'effacement, pas du texte : son nom accessible vient des traductions. */
const DELETE_GLYPH = '⌫';

export type PinPadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /** Clavier inerte (pause anti-force brute, vérification en cours). */
  disabled?: boolean;
  testID?: string;
};

/**
 * Pavé numérique du code parent. Clavier dessiné plutôt que clavier système :
 * pas de suggestion, pas de presse-papiers, pas de saisie prédictive qui
 * mémoriserait le code. Touches de 56 et 16 d'écart (cibles ≥ 48, invariant n°11).
 */
export function PinPad({ onDigit, onDelete, disabled = false, testID }: PinPadProps): React.JSX.Element {
  return (
    <View style={{ gap: space[3], alignItems: 'center' }} testID={testID}>
      {DIGIT_ROWS.map((row) => (
        <View key={row.join('')} style={{ flexDirection: 'row', gap: space[6] }}>
          {row.map((digit) => (
            <PinKey key={digit} label={digit} accessibilityLabel={digit} onPress={() => onDigit(digit)} disabled={disabled} />
          ))}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: space[6] }}>
        <View style={{ width: KEY_SIZE, height: KEY_SIZE }} />
        <PinKey label={ZERO} accessibilityLabel={ZERO} onPress={() => onDigit(ZERO)} disabled={disabled} />
        <PinKey label={DELETE_GLYPH} accessibilityLabel={t('pinPad.delete')} onPress={onDelete} disabled={disabled} subtle />
      </View>
    </View>
  );
}

function PinKey({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  subtle = false,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
  subtle?: boolean;
}): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="keyboardkey"
      accessibilityLabel={accessibilityLabel}
    >
      {({ focused }) => (
        <View
          style={{
            width: KEY_SIZE,
            height: KEY_SIZE,
            borderRadius: KEY_SIZE / 2,
            backgroundColor: subtle ? 'transparent' : theme.colors.surface,
            borderWidth: focused ? border.focus : 0,
            borderColor: theme.colors.focusRing,
            opacity: disabled ? 0.4 : 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText
            // Le chiffre doit rester dans sa touche ronde : on plafonne la
            // mise à l'échelle plutôt que de la couper (la touche est déjà grande).
            allowFontScaling
            maxFontSizeMultiplier={1.5}
            style={{
              ...fontStyle(typography.family.text, typography.h2.fontWeight),
              fontSize: typography.h2.fontSize,
              color: theme.colors.textPrimary,
            }}
          >
            {label}
          </RNText>
        </View>
      )}
    </Pressable>
  );
}

/** Pastilles de progression de la saisie, sans révéler les chiffres. */
export function CodeDots({ length, filled }: { length: number; filled: number }): React.JSX.Element {
  const { theme } = useTheme();
  const size = space[4];
  return (
    <View
      accessible
      accessibilityLabel={t('pinPad.progress', { count: filled, total: length })}
      style={{ flexDirection: 'row', gap: space[3], justifyContent: 'center' }}
    >
      {Array.from({ length }, (_, index) => (
        <View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border.focus,
            borderColor: theme.colors.textPrimary,
            backgroundColor: index < filled ? theme.colors.textPrimary : 'transparent',
          }}
        />
      ))}
    </View>
  );
}
