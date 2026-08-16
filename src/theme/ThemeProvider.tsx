import React, { createContext, useContext, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import { breakpoints, childTheme, parentTheme, themes, type BreakpointName, type Theme } from './theme';

export type ThemeMode = keyof typeof themes;

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

// No default value: reading useTheme() outside a ThemeProvider is a bug we
// want to fail loudly on, not silently fall back to a theme the screen
// never asked for.
const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  /** Thème au premier rendu. Le mode enfant/parent réel est piloté par la
   * machine d'état de mode (`src/navigation`), pas par ce composant. */
  initialMode?: ThemeMode;
  children: React.ReactNode;
};

export function ThemeProvider({ initialMode = 'parent', children }: ThemeProviderProps): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[mode],
      mode,
      setMode,
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Un composant ne connaît pas son thème : il consomme les rôles exposés ici
 * (`theme.colors.action`, `theme.radius.card`…), jamais `palette` directement.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/** Exposés pour les cas rares qui ont besoin du thème hors contexte React (ex. tests). */
export { childTheme, parentTheme };

// ─────────────────────────────────────────────────────────────
// Tablette — résolution du point de rupture courant
// ─────────────────────────────────────────────────────────────

function resolveBreakpoint(width: number): BreakpointName {
  if (width >= breakpoints.expanded) return 'expanded';
  if (width >= breakpoints.medium) return 'medium';
  return 'compact';
}

/**
 * Largeur de fenêtre logique, pas taille physique d'appareil : une iPad en
 * split-view peut être `compact`, un téléphone en paysage peut être `medium`.
 */
export function useBreakpoint(): BreakpointName {
  const { width } = useWindowDimensions();
  return useMemo(() => resolveBreakpoint(width), [width]);
}
