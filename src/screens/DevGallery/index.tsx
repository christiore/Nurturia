import React from 'react';
import { ScrollView, View } from 'react-native';

import { Box } from '../../components/primitives/Box';
import { Pressable } from '../../components/primitives/Pressable';
import { Text } from '../../components/primitives/Text';
import { Button, type ButtonVariant } from '../../components/Button/Button';
import { IconButton } from '../../components/Button/IconButton';
import { useBreakpoint, useTheme } from '../../theme/ThemeProvider';
import { componentSize, layout } from '../../theme/theme';
import { t } from '../../i18n';

/**
 * Galerie de composants — PROMPTSESSION1.md §7. Écran de développement,
 * pas destiné à la production : il n'a pas vocation à suivre la règle des
 * quatre états de liste (CLAUDE.md §3 n°12), il n'affiche aucune liste de
 * données, seulement les composants du système en dur.
 */
export function DevGallery(): React.JSX.Element {
  const { theme, mode, setMode } = useTheme();
  const breakpoint = useBreakpoint();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{
        paddingHorizontal: layout.screenPaddingH,
        paddingVertical: layout.sectionGap,
        gap: layout.sectionGap,
      }}
    >
      <View
        testID="dev-gallery-content"
        style={{ width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', gap: layout.sectionGap }}
      >
        <GalleryHeader breakpoint={breakpoint} mode={mode} onSelectMode={setMode} />
        <TextSection />
        <BoxSection />
        <PressableSection />
        <ButtonSection />
        <IconButtonSection />
      </View>
    </ScrollView>
  );
}

function GalleryHeader({
  breakpoint,
  mode,
  onSelectMode,
}: {
  breakpoint: string;
  mode: 'child' | 'parent';
  onSelectMode: (mode: 'child' | 'parent') => void;
}): React.JSX.Element {
  return (
    <Box gap={4}>
      <Text variant="displayL" color="textPrimary">
        {t('app.name')}
      </Text>
      <Text variant="h2" color="textSecondary">
        {t('devGallery.title')}
      </Text>
      <Text variant="caption" color="textMuted">
        {t('devGallery.notForProduction')}
      </Text>
      <Box direction="row" gap={2} align="center">
        <Text variant="label" color="textSecondary">
          {t('devGallery.breakpointLabel')}
        </Text>
        <Text variant="label" color="accent">
          {breakpoint}
        </Text>
      </Box>
      <Box direction="row" gap={2}>
        <Button
          label={t('devGallery.themeParentLabel')}
          variant={mode === 'parent' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => onSelectMode('parent')}
          accessibilityLabel={t('devGallery.themeToggleAccessibilityLabel')}
        />
        <Button
          label={t('devGallery.themeChildLabel')}
          variant={mode === 'child' ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => onSelectMode('child')}
          accessibilityLabel={t('devGallery.themeToggleAccessibilityLabel')}
        />
      </Box>
    </Box>
  );
}

const TEXT_VARIANTS = ['displayL', 'h1', 'h2', 'h3', 'bodyL', 'body', 'caption', 'label'] as const;

function TextSection(): React.JSX.Element {
  return (
    <Box gap={3}>
      <Text variant="h3" color="textPrimary">
        {t('devGallery.textSectionTitle')}
      </Text>
      <Box gap={2}>
        {TEXT_VARIANTS.map((variant) => (
          <Text key={variant} variant={variant} color="textPrimary">
            {t('devGallery.textSample')}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

function BoxSection(): React.JSX.Element {
  const { theme } = useTheme();
  const swatchColors = [theme.colors.accent, theme.colors.progress, theme.colors.info];

  return (
    <Box gap={3}>
      <Text variant="h3" color="textPrimary">
        {t('devGallery.boxSectionTitle')}
      </Text>
      <Text variant="caption" color="textMuted">
        {t('devGallery.boxDemoLabel')}
      </Text>
      <Box direction="row" gap={3}>
        {swatchColors.map((color) => (
          <View
            key={color}
            style={{
              width: componentSize.avatar.lg,
              height: componentSize.avatar.lg,
              borderRadius: theme.radius.field,
              backgroundColor: color,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function PressableSection(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Box gap={3}>
      <Text variant="h3" color="textPrimary">
        {t('devGallery.pressableSectionTitle')}
      </Text>
      <Pressable accessibilityLabel={t('devGallery.pressableDemoLabel')} onPress={() => undefined}>
        <View
          style={{
            width: componentSize.sliderThumb,
            height: componentSize.sliderThumb,
            borderRadius: theme.radius.field,
            backgroundColor: theme.colors.action,
          }}
        />
      </Pressable>
      <Text variant="micro" color="textMuted">
        {t('devGallery.pressableHitSlopNote')}
      </Text>
    </Box>
  );
}

const BUTTON_VARIANTS: readonly ButtonVariant[] = [
  'primaryWithAffordance',
  'primary',
  'secondary',
  'tonal',
  'ghost',
  'destructive',
];

function ButtonSection(): React.JSX.Element {
  return (
    <Box gap={3}>
      <Text variant="h3" color="textPrimary">
        {t('devGallery.buttonSectionTitle')}
      </Text>
      <Box gap={2}>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} label={variantLabel(variant)} variant={variant} size="md" onPress={() => undefined} />
        ))}
      </Box>
      <Text variant="label" color="textSecondary">
        {t('devGallery.buttonStateLoading')}
      </Text>
      <Button label={t('devGallery.buttonStateLoading')} loading />
      <Text variant="label" color="textSecondary">
        {t('devGallery.buttonStateDisabled')}
      </Text>
      <Button label={t('devGallery.buttonStateDisabled')} disabled disabledReason={t('devGallery.buttonDisabledReason')} />
    </Box>
  );
}

function variantLabel(variant: ButtonVariant): string {
  switch (variant) {
    case 'primaryWithAffordance':
      return t('devGallery.buttonVariantPrimaryAffordance');
    case 'primary':
      return t('devGallery.buttonVariantPrimary');
    case 'secondary':
      return t('devGallery.buttonVariantSecondary');
    case 'tonal':
      return t('devGallery.buttonVariantTonal');
    case 'ghost':
      return t('devGallery.buttonVariantGhost');
    case 'destructive':
      return t('devGallery.buttonVariantDestructive');
    default: {
      const exhaustive: never = variant;
      throw new Error(`Variante non gérée : ${String(exhaustive)}`);
    }
  }
}

function IconButtonSection(): React.JSX.Element {
  const { theme } = useTheme();
  const dotIcon = (
    <View
      style={{
        width: componentSize.sliderThumb / 2,
        height: componentSize.sliderThumb / 2,
        borderRadius: theme.radius.control,
        backgroundColor: theme.colors.actionText,
      }}
    />
  );

  return (
    <Box gap={3}>
      <Text variant="h3" color="textPrimary">
        {t('devGallery.iconButtonSectionTitle')}
      </Text>
      <Box direction="row" gap={3}>
        <IconButton icon={dotIcon} variant="primary" accessibilityLabel={t('devGallery.iconButtonBackLabel')} onPress={() => undefined} />
        <IconButton icon={dotIcon} variant="secondary" accessibilityLabel={t('devGallery.iconButtonMicLabel')} onPress={() => undefined} />
        <IconButton icon={dotIcon} variant="tonal" accessibilityLabel={t('devGallery.iconButtonArrowLabel')} onPress={() => undefined} />
      </Box>
    </Box>
  );
}
