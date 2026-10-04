import React from 'react';
import { useRouter } from 'expo-router';

import { devParentCodeStore } from '../../src/features/auth/devParentCodeStore';
import { ParentHome } from '../../src/screens/ParentHome';

export default function ParentHomeRoute(): React.JSX.Element {
  const router = useRouter();

  // Pas de bascule en mode enfant sans code parent : sinon le verrou
  // n'aurait rien à vérifier (PARCOURS.md §3).
  const switchToChild = async (): Promise<void> => {
    const hasCode = await devParentCodeStore.hasParentCode();
    router.push(hasCode ? '/parent/choose-child' : '/parent/create-code');
  };

  return (
    <ParentHome
      onSwitchToChild={() => void switchToChild()}
      onOpenDevGallery={__DEV__ ? () => router.push('/parent/dev-gallery') : undefined}
    />
  );
}
