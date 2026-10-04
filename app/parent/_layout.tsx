import React from 'react';
import { Stack } from 'expo-router';

import { useTheme } from '../../src/theme/ThemeProvider';

export default function ParentLayout(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="choose-child" options={{ presentation: 'modal' }} />
      <Stack.Screen name="create-code" options={{ presentation: 'modal' }} />
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="dev-gallery" />
      </Stack.Protected>
    </Stack>
  );
}
