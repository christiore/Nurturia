import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { DevGallery } from './src/screens/DevGallery';
import { ThemeProvider } from './src/theme/ThemeProvider';

/**
 * Session 1 (fondations) : aucun écran produit, aucune authentification.
 * DevGallery est la seule exception explicitement prévue par
 * PROMPTSESSION1.md §7 — un écran de développement, pas un point d'entrée
 * de production. Le routeur réel (avec son garde de mode, voir
 * src/navigation/) arrivera avec les écrans qu'il doit garder.
 */
export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <DevGallery />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
