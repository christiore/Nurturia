import React, { useCallback, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';
import { fontStyle } from '../../theme/fonts';
import { border, componentSize, space, typography } from '../../theme/theme';

/**
 * Les quatre props que UI-GUIDELINES.md §5 dit « oubliées systématiquement »
 * sont obligatoires ici : l'appelant doit choisir, au minimum `'none'` /
 * `'off'`, plutôt que d'hériter d'un défaut qui casse le remplissage auto.
 */
type KeyboardProps = Required<Pick<TextInputProps, 'keyboardType' | 'returnKeyType' | 'autoComplete' | 'textContentType'>>;

export type TextFieldProps = KeyboardProps & {
  /** Label toujours visible au-dessus du champ (règle n°1) — déjà traduit. */
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Aide sous le champ, 13 px. Remplacée par le message d'erreur s'il y en a un. */
  helper?: string;
  /**
   * Validation au blur, jamais à la frappe (règle n°5). Une fois le champ en
   * erreur, il se revalide à chaque frappe pour que la correction soit
   * immédiatement visible. Renvoie un message qui dit quoi faire (règle n°6).
   */
  validate?: (value: string) => string | undefined;
  /** Erreur imposée par l'appelant (ex. réponse serveur). Prioritaire sur `validate`. */
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  maxLength?: number;
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  helper,
  validate,
  error,
  placeholder,
  multiline,
  secureTextEntry,
  maxLength,
  editable = true,
  autoCapitalize,
  keyboardType,
  returnKeyType,
  autoComplete,
  textContentType,
  onSubmitEditing,
  onBlur,
  testID,
}: TextFieldProps): React.JSX.Element {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  const handleChangeText = useCallback(
    (next: string) => {
      onChangeText(next);
      // Revalidation à la frappe seulement si le champ est déjà en erreur.
      if (validate && validationError !== undefined) {
        setValidationError(validate(next));
      }
    },
    [onChangeText, validate, validationError],
  );

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (validate) setValidationError(validate(value));
    onBlur?.();
  }, [validate, value, onBlur]);

  const handleFocus = useCallback(() => setFocused(true), []);

  const shownError = error ?? validationError;
  const hasError = shownError !== undefined;
  const supportText = shownError ?? helper;

  const fieldBorderColor = hasError ? theme.colors.error : focused ? theme.colors.accent : 'transparent';
  const haloColor = focused ? (hasError ? theme.colors.errorBg : theme.colors.infoBg) : 'transparent';

  return (
    <Box gap={2}>
      <Text variant="label" color="textPrimary">
        {label}
      </Text>
      {/* Halo de 4 px au focus (UI-GUIDELINES.md §5). La marge négative garde
          le bord visible du champ aligné sur le label. */}
      <View
        style={{
          borderWidth: space[1],
          borderColor: haloColor,
          borderRadius: theme.radius.field + space[1],
          marginHorizontal: -space[1],
          marginVertical: -space[1],
        }}
      >
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          editable={editable}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          allowFontScaling
          // TextInput est déjà exposé comme champ éditable par la plateforme :
          // un accessibilityRole le dégraderait. Le nom vient du label, l'aide
          // ou l'erreur est lue en indication.
          accessibilityLabel={label}
          accessibilityHint={supportText}
          accessibilityState={{ disabled: !editable }}
          testID={testID}
          style={{
            // minHeight et non height : le texte doit pouvoir grandir à 200 %.
            minHeight: multiline ? componentSize.textarea.minHeight : componentSize.field.height,
            paddingHorizontal: componentSize.field.paddingH,
            paddingVertical: multiline ? componentSize.textarea.paddingV : undefined,
            borderRadius: theme.radius.field,
            borderWidth: componentSize.field.borderWidth,
            borderColor: fieldBorderColor,
            backgroundColor: hasError ? theme.colors.errorBg : theme.colors.surfaceSunken,
            color: theme.colors.textPrimary,
            ...fontStyle(typography.family.text, typography.bodyL.fontWeight),
            fontSize: typography.bodyL.fontSize,
            textAlignVertical: multiline ? 'top' : 'center',
            opacity: editable ? 1 : 0.4,
          }}
        />
      </View>
      {supportText !== undefined ? (
        <Box direction="row" gap={2} align="center">
          {hasError ? <ErrorGlyph /> : null}
          <Text
            variant="caption"
            color={hasError ? 'error' : 'textSecondary'}
            accessibilityLiveRegion={hasError ? 'polite' : 'none'}
          >
            {supportText}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}

/**
 * Pastille d'erreur dessinée en vues, en attendant le jeu d'icônes
 * (UI-GUIDELINES.md §11). La couleur ne porte jamais seule l'information :
 * le message texte l'accompagne toujours (invariant n°18).
 */
function ErrorGlyph(): React.JSX.Element {
  const { theme } = useTheme();
  const size = space[4];
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.error,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: border.focus,
          height: size / 2,
          borderRadius: border.hairline,
          backgroundColor: theme.colors.actionText,
        }}
      />
    </View>
  );
}
