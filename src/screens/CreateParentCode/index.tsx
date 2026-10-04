import React, { useCallback, useState } from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/Button/Button';
import { CodeDots, PinPad } from '../../components/PinPad/PinPad';
import { Screen } from '../../components/Screen/Screen';
import { devParentCodeStore, type ParentCodeStore } from '../../features/auth/devParentCodeStore';
import { PARENT_CODE_LENGTH } from '../../features/auth/parentCode';
import { t } from '../../i18n';

type Step = 'choose' | 'confirm';
type Feedback = 'mismatch' | 'rejected' | null;

export type CreateParentCodeProps = {
  onCreated: () => void;
  onCancel: () => void;
  store?: ParentCodeStore;
};

/**
 * Création du code parent : saisie, puis confirmation. Les codes trop faciles
 * (suites, répétitions, dates de naissance) sont refusés sans dire pourquoi
 * précisément (parentCode.ts). Les dates de naissance ne sont pas encore
 * connues de l'app : la liste noire ne couvre pour l'instant que les motifs.
 */
export function CreateParentCode({ onCreated, onCancel, store = devParentCodeStore }: CreateParentCodeProps): React.JSX.Element {
  const [step, setStep] = useState<Step>('choose');
  const [first, setFirst] = useState('');
  const [digits, setDigits] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const submit = useCallback(
    async (code: string) => {
      if (step === 'choose') {
        setFirst(code);
        setDigits('');
        setStep('confirm');
        return;
      }
      if (code !== first) {
        setFeedback('mismatch');
        setFirst('');
        setDigits('');
        setStep('choose');
        return;
      }
      setBusy(true);
      const result = await store.createParentCode(code);
      setBusy(false);
      if (result === 'rejected') {
        setFeedback('rejected');
        setFirst('');
        setDigits('');
        setStep('choose');
        return;
      }
      onCreated();
    },
    [step, first, store, onCreated],
  );

  const pressDigit = useCallback(
    (digit: string) => {
      if (busy || digits.length >= PARENT_CODE_LENGTH) return;
      const next = digits + digit;
      setDigits(next);
      if (step === 'choose') setFeedback(null);
      if (next.length === PARENT_CODE_LENGTH) void submit(next);
    },
    [busy, digits, step, submit],
  );

  const deleteDigit = useCallback(() => setDigits((current) => current.slice(0, -1)), []);

  return (
    <Screen footer={<Button label={t('common.cancel')} variant="ghost" onPress={onCancel} />}>
      <Box gap={2}>
        <Text variant="h1" color="textPrimary" accessibilityRole="header">
          {step === 'choose' ? t('createCode.title') : t('createCode.confirmTitle')}
        </Text>
        <Text variant="body" color="textSecondary">
          {step === 'choose' ? t('createCode.body') : t('createCode.confirmBody')}
        </Text>
      </Box>
      <CodeDots length={PARENT_CODE_LENGTH} filled={digits.length} />
      {feedback !== null ? (
        <Text variant="bodyStrong" color="textPrimary" align="center" accessibilityLiveRegion="polite">
          {feedback === 'mismatch' ? t('createCode.mismatch') : t('createCode.rejected')}
        </Text>
      ) : null}
      <PinPad onDigit={pressDigit} onDelete={deleteDigit} disabled={busy} />
      {__DEV__ ? (
        <Text variant="caption" color="textMuted" align="center">
          {t('createCode.devNotice')}
        </Text>
      ) : null}
    </Screen>
  );
}
