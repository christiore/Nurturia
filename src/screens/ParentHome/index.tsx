import React from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/Button/Button';
import { Screen } from '../../components/Screen/Screen';
import { t } from '../../i18n';

export type ParentHomeProps = {
  onSwitchToChild: () => void;
  /** Présent seulement en développement. */
  onOpenDevGallery?: () => void;
};

/**
 * Écran « Aujourd'hui » du parent — squelette. Le contenu réel (résumé vocal
 * ou hebdomadaire, suivi) dépend de DECISIONS-OUVERTES.md §7.2 : on affiche
 * pour l'instant l'état « pas encore de données », qui existera de toute façon.
 * Un seul bouton primaire : « Passer en mode enfant » (invariant n°16).
 */
export function ParentHome({ onSwitchToChild, onOpenDevGallery }: ParentHomeProps): React.JSX.Element {
  return (
    <Screen
      footer={
        <>
          <Button label={t('parentHome.switchToChild')} variant="primary" size="lg" onPress={onSwitchToChild} />
          {onOpenDevGallery ? (
            <Button label={t('parentHome.devGallery')} variant="ghost" size="sm" onPress={onOpenDevGallery} />
          ) : null}
        </>
      }
    >
      <Text variant="displayL" color="textPrimary" accessibilityRole="header">
        {t('parentHome.title')}
      </Text>
      <Box gap={2}>
        <Text variant="h3" color="textPrimary">
          {t('parentHome.emptyTitle')}
        </Text>
        <Text variant="body" color="textSecondary">
          {t('parentHome.emptyBody')}
        </Text>
      </Box>
    </Screen>
  );
}
