import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ModeProvider, useModeState } from '../src/navigation/ModeProvider';
import { FONT_FILES } from '../src/theme/fonts';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

/**
 * Racine de l'app. Le mode (parent / enfant) est restauré AVANT le premier
 * rendu de la navigation (ModeProvider) : tuer l'app en mode enfant la
 * rouvre en mode enfant (invariant n°7).
 *
 * Les routes de l'autre mode n'existent pas tant que le garde est faux
 * (`Stack.Protected`) : un lien profond vers /parent depuis le mode enfant
 * ne mène nulle part. Quand le mode change, Expo Router retire l'historique
 * protégé et revient à `index`, qui redirige vers le bon espace.
 */
export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);

  // Polices en échec : on continue avec celles du système plutôt que de
  // bloquer l'app sur un écran vide.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ModeProvider>
        <ThemedNavigation />
      </ModeProvider>
    </SafeAreaProvider>
  );
}

function ThemedNavigation(): React.JSX.Element {
  const { mode } = useModeState();
  return (
    <ThemeProvider initialMode={mode}>
      <ThemeSync />
      <RootStack />
    </ThemeProvider>
  );
}

/** Le thème suit le mode de l'app ; le mode reste la seule source de vérité. */
function ThemeSync(): null {
  const { mode } = useModeState();
  const { setMode } = useTheme();
  useEffect(() => setMode(mode), [mode, setMode]);
  return null;
}

function RootStack(): React.JSX.Element {
  const { mode } = useModeState();
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={mode === 'parent'}>
          <Stack.Screen name="parent" />
        </Stack.Protected>
        <Stack.Protected guard={mode === 'child'}>
          <Stack.Screen name="child" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
