import React from 'react';
import { useRouter } from 'expo-router';

import { CreateParentCode } from '../../src/screens/CreateParentCode';

export default function CreateCodeRoute(): React.JSX.Element {
  const router = useRouter();
  return <CreateParentCode onCreated={() => router.replace('/parent/choose-child')} onCancel={() => router.back()} />;
}
