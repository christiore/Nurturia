import React from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { ModeBanner } from '../../components/ModeBanner/ModeBanner';
import { Screen } from '../../components/Screen/Screen';
import { t } from '../../i18n';

export type ChildHomeProps = {
  childFirstName: string;
  onRequestParent: () => void;
};

/**
 * Accueil du mode enfant — squelette. Les activités (devoir, évaluation,
 * notion) dépendent du contrat du coach et du contenu (DECISIONS-OUVERTES.md
 * §3.1, §3.8, §7.5) : rien n'est inventé ici en attendant.
 */
export function ChildHome({ childFirstName, onRequestParent }: ChildHomeProps): React.JSX.Element {
  return (
    <Screen>
      <ModeBanner childFirstName={childFirstName} onRequestParent={onRequestParent} />
      <Box gap={3}>
        <Text variant="displayL" color="textPrimary" accessibilityRole="header">
          {t('childHome.greeting', { name: childFirstName })}
        </Text>
        <Text variant="bodyL" color="textSecondary">
          {t('childHome.body')}
        </Text>
      </Box>
    </Screen>
  );
}
