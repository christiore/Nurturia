import React from 'react';
import { useRouter } from 'expo-router';

import { useModeState } from '../../src/navigation/ModeProvider';
import { ChooseChild } from '../../src/screens/ChooseChild';

export default function ChooseChildRoute(): React.JSX.Element {
  const router = useRouter();
  const { setMode } = useModeState();

  // Le mode est persisté avant d'être appliqué (ModeProvider) ; le garde
  // parent tombe alors et la navigation rejoint /child d'elle-même.
  return <ChooseChild onConfirm={(childId) => void setMode('child', childId)} onCancel={() => router.back()} />;
}
