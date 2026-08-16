import { getSecureItem, setSecureItem, SecureStoreKey } from '../services/secureStore';

/**
 * Machine d'état de mode — CLAUDE.md invariant produit n°7 : « L'application
 * rouvre dans le mode où elle a été fermée — tuer l'application ne doit
 * jamais faire sauter le verrou. » Persistée dans secureStore (pas
 * AsyncStorage : voir le commentaire de secureStore.ts sur pourquoi
 * l'intégrité de ce flag fait partie du périmètre de sécurité), et à
 * restaurer avant tout rendu de l'arbre réel (voir ModeProvider.tsx).
 */
export type AppMode = 'parent' | 'child';

export type ModeState = {
  mode: AppMode;
  activeChildId: string | null;
};

/**
 * Aucune session persistée n'est pas la même chose qu'un mode enfant actif :
 * en l'absence de toute valeur stockée (premier lancement, stockage vidé),
 * on ne peut pas prétendre qu'un enfant est "actif" — le mode parent est le
 * seul défaut qui ne présuppose pas un contournement du verrou.
 */
export const DEFAULT_MODE_STATE: ModeState = { mode: 'parent', activeChildId: null };

function isAppMode(value: string | null): value is AppMode {
  return value === 'parent' || value === 'child';
}

export async function restoreModeState(): Promise<ModeState> {
  const [storedMode, storedChildId] = await Promise.all([
    getSecureItem(SecureStoreKey.appMode),
    getSecureItem(SecureStoreKey.activeChildId),
  ]);

  if (!isAppMode(storedMode)) {
    return DEFAULT_MODE_STATE;
  }
  const activeChildId = storedChildId === null || storedChildId === '' ? null : storedChildId;
  return { mode: storedMode, activeChildId: storedMode === 'child' ? activeChildId : null };
}

export async function persistModeState(state: ModeState): Promise<void> {
  await setSecureItem(SecureStoreKey.appMode, state.mode);
  await setSecureItem(SecureStoreKey.activeChildId, state.activeChildId ?? '');
}
