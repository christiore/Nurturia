import React from 'react';
import { useRouter } from 'expo-router';

import { useActiveChild } from '../../src/features/children/useActiveChild';
import { ChildHome } from '../../src/screens/ChildHome';

export default function ChildHomeRoute(): React.JSX.Element | null {
  const router = useRouter();
  const active = useActiveChild();
  if (active.status === 'loading') return null;
  return <ChildHome childFirstName={active.firstName} onRequestParent={() => router.push('/child/parent-code')} />;
}
