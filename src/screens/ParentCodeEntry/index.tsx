import React, { useState } from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/Button/Button';
import { CodeDots, PinPad } from '../../components/PinPad/PinPad';
import { Screen } from '../../components/Screen/Screen';
import { type ParentCodeStore } from '../../features/auth/devParentCodeStore';
import { PARENT_CODE_LENGTH } from '../../features/auth/parentCode';
import { useParentCodeEntry } from '../../features/auth/useParentCodeEntry';
import { t } from '../../i18n';

export type ParentCodeEntryProps = {
  childFirstName: string;
  onUnlocked: () => void;
  onBack: () => void;
  store?: ParentCodeStore;
};

function formatRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Sortie du mode enfant (PARCOURS.md §3). Le nombre d'essais restants avant
 * la pause est toujours affiché, jamais caché. La biométrie n'est pas encore
 * proposée : elle ne doit l'être que sur l'appareil du parent
 * (`canUseBiometricUnlock`), et l'appel `expo-local-authentication` reste à faire.
 */
export function ParentCodeEntry({ childFirstName, onUnlocked, onBack, store }: ParentCodeEntryProps): React.JSX.Element {
  const entry = useParentCodeEntry({ onUnlocked, store });
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  let message: string | null = null;
  if (entry.lockout?.locked) {
    message = t('parentCode.locked', { time: formatRemaining(entry.lockout.remainingSeconds) });
  } else if (entry.status === 'checking') {
    message = t('parentCode.checking');
  } else if (entry.status === 'wrong' && entry.lockout) {
    const remaining = entry.lockout.attemptsRemainingBeforeLockout;
    message = remaining === 1 ? t('parentCode.wrongOne') : t('parentCode.wrongMany', { count: remaining });
  }

  return (
    <Screen
      footer={
        <>
          <Button label={t('parentCode.forgot')} variant="ghost" onPress={() => setShowForgotInfo(true)} />
          <Button label={t('parentCode.back', { name: childFirstName })} variant="secondary" onPress={onBack} />
        </>
      }
    >
      <Box gap={2}>
        <Text variant="h1" color="textPrimary" accessibilityRole="header">
          {t('parentCode.title')}
        </Text>
        <Text variant="body" color="textSecondary">
          {t('parentCode.body')}
        </Text>
      </Box>
      <CodeDots length={PARENT_CODE_LENGTH} filled={entry.digits.length} />
      <Box paddingVertical={1}>
        {message !== null ? (
          <Text variant="bodyStrong" color="textPrimary" align="center" accessibilityLiveRegion="polite" testID="parent-code-message">
            {message}
          </Text>
        ) : null}
      </Box>
      <PinPad onDigit={entry.pressDigit} onDelete={entry.deleteDigit} disabled={entry.isLocked || entry.status === 'checking'} />
      {showForgotInfo ? (
        <Text variant="caption" color="textSecondary" align="center" accessibilityLiveRegion="polite">
          {t('parentCode.forgotInfo')}
        </Text>
      ) : null}
    </Screen>
  );
}
