import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DevGallery } from '../../src/screens/DevGallery';
import { useTheme } from '../../src/theme/ThemeProvider';

/** Galerie des composants — protégée par `__DEV__` dans le layout parent. */
export default function DevGalleryRoute(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <DevGallery />
    </SafeAreaView>
  );
}
