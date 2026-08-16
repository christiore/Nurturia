import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { DEFAULT_MODE_STATE, persistModeState, restoreModeState, type AppMode, type ModeState } from './modeState';

type ModeContextValue = ModeState & {
  /** Bascule de mode : persiste avant de mettre à jour l'état affiché. */
  setMode: (mode: AppMode, activeChildId?: string | null) => Promise<void>;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export type ModeProviderProps = {
  /**
   * Affiché pendant la restauration (PARCOURS.md Phase 0 : 400 ms maximum
   * sur l'écran de lancement). `null` par défaut plutôt qu'un splash —
   * cet écran de démarrage n'est pas construit dans cette session.
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Restaure le mode AVANT tout rendu de l'arbre réel (PROMPTSESSION1.md §6 :
 * « persistée et restaurée avant tout rendu »). Tant que la restauration
 * n'est pas terminée, seul `fallback` est monté — jamais `children`, jamais
 * une valeur de mode par défaut optimiste pendant que la vraie valeur
 * charge encore.
 */
export function ModeProvider({ fallback = null, children }: ModeProviderProps): React.JSX.Element {
  const [state, setState] = useState<ModeState | null>(null);

  useEffect(() => {
    let mounted = true;
    restoreModeState().then((restored) => {
      if (mounted) setState(restored);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (mode: AppMode, activeChildId: string | null = null) => {
    const next: ModeState = { mode, activeChildId: mode === 'child' ? activeChildId : null };
    await persistModeState(next);
    setState(next);
  }, []);

  if (state === null) {
    return <>{fallback}</>;
  }

  return <ModeContext.Provider value={{ ...state, setMode }}>{children}</ModeContext.Provider>;
}

export function useModeState(): ModeContextValue {
  const context = useContext(ModeContext);
  if (context === null) {
    throw new Error('useModeState must be used within a ModeProvider');
  }
  return context;
}

export { DEFAULT_MODE_STATE };
