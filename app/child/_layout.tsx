import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../src/theme/ThemeProvider';

export default function ChildLayout(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="parent-code" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
