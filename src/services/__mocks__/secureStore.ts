/**
 * Faux stockage sécurisé en mémoire pour les tests de lockout.ts et
 * modeState.ts — activé via `jest.mock('.../services/secureStore')` sans
 * fabrique, convention Jest pour les mocks manuels de modules locaux.
 */
import type { SecureStoreKeyName } from '../secureStore';

// jest.requireActual, pas un import normal : un import normal de
// '../secureStore' serait lui-même redirigé vers ce mock par
// jest.mock('../../../services/secureStore') et boucler indéfiniment.
export const { SecureStoreKey } = jest.requireActual<typeof import('../secureStore')>('../secureStore');
export type { SecureStoreKeyName };

let store = new Map<string, string>();

export async function getSecureItem(key: SecureStoreKeyName): Promise<string | null> {
  return store.has(key) ? store.get(key)! : null;
}

export async function setSecureItem(key: SecureStoreKeyName, value: string): Promise<void> {
  store.set(key, value);
}

export async function deleteSecureItem(key: SecureStoreKeyName): Promise<void> {
  store.delete(key);
}

export async function isSecureStoreAvailable(): Promise<boolean> {
  return true;
}

/** Test-only : réinitialise le faux stockage entre deux cas. */
export function __resetSecureStore(): void {
  store = new Map<string, string>();
}
