import React from 'react';
import { useRouter } from 'expo-router';

import { useActiveChild } from '../../src/features/children/useActiveChild';
import { useModeState } from '../../src/navigation/ModeProvider';
import { ParentCodeEntry } from '../../src/screens/ParentCodeEntry';

export default function ParentCodeRoute(): React.JSX.Element | null {
  const router = useRouter();
  const { setMode } = useModeState();
  const active = useActiveChild();
  if (active.status === 'loading') return null;
  return (
    <ParentCodeEntry
      childFirstName={active.firstName}
      // Le garde enfant tombe, la navigation rejoint /parent d'elle-même.
      onUnlocked={() => void setMode('parent')}
      onBack={() => router.back()}
    />
  );
}
