import React from 'react';
import { View } from 'react-native';

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Button } from '../Button/Button';
import { useTheme } from '../../theme/ThemeProvider';
import { componentSize, space } from '../../theme/theme';
import { t } from '../../i18n';

type StateCopy = {
  /** Visuel. Par défaut, l'emplacement réservé à la mascotte (pas encore livrée). */
  visual?: React.ReactNode;
  /** Titre court. */
  title: string;
  /**
   * Une phrase qui constate et normalise, sans culpabiliser (CLAUDE.md §4) :
   * « Pas de session cette semaine. C'est fréquent pendant les vacances. »
   */
  body: string;
  testID?: string;
};

export type EmptyStateProps = StateCopy & {
  /** L'action est obligatoire : un état vide n'est jamais une impasse (UI-GUIDELINES.md §6). */
  action: { label: string; onPress: () => void };
};

/** État vide : visuel, titre court, une phrase, une action. Jamais un écran blanc. */
export function EmptyState({ visual, title, body, action, testID }: EmptyStateProps): React.JSX.Element {
  return (
    <StateLayout visual={visual} title={title} body={body} testID={testID}>
      <Button label={action.label} onPress={action.onPress} variant="secondary" />
    </StateLayout>
  );
}

export type ErrorStateProps = StateCopy & {
  onRetry: () => void;
};

/**
 * État d'erreur : même structure que l'état vide, plus « Réessayer ».
 * Le texte dit quoi faire, pas ce qui est cassé (CLAUDE.md §4). Pas de rouge
 * ici : une donnée qui ne charge pas n'est pas une erreur de saisie.
 */
export function ErrorState({ visual, title, body, onRetry, testID }: ErrorStateProps): React.JSX.Element {
  return (
    <StateLayout visual={visual} title={title} body={body} testID={testID}>
      <Button label={t('common.retry')} onPress={onRetry} variant="primary" />
    </StateLayout>
  );
}

function StateLayout({
  visual,
  title,
  body,
  testID,
  children,
}: Omit<StateCopy, 'visual'> & { visual?: React.ReactNode; children: React.ReactNode }): React.JSX.Element {
  return (
    <Box align="center" gap={3} paddingVertical={7} paddingHorizontal={4} testID={testID}>
      {visual ?? <VisualPlaceholder />}
      <Text variant="h2" color="textPrimary" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center">
        {body}
      </Text>
      <Box marginTop={2}>{children}</Box>
    </Box>
  );
}

/** Emplacement réservé à la mascotte (UI-GUIDELINES.md §11 : illustrations à créer). */
function VisualPlaceholder(): React.JSX.Element {
  const { theme } = useTheme();
  const size = componentSize.avatar.lg * 2;
  return (
    <View
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.surfaceSunken,
        marginBottom: space[2],
      }}
    />
  );
}
