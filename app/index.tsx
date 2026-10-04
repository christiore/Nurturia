import React from 'react';
import { Redirect } from 'expo-router';

import { useModeState } from '../src/navigation/ModeProvider';

/** Point d'entrée : renvoie vers l'espace du mode restauré. */
export default function Index(): React.JSX.Element {
  const { mode } = useModeState();
  return <Redirect href={mode === 'child' ? '/child' : '/parent'} />;
}
