import * as SecureStore from 'expo-secure-store';

/**
 * Seule voie d'accès au stockage sensible (PROMPTSESSION1.md §6), appuyée
 * sur `expo-secure-store` (Keychain iOS / Keystore Android).
 *
 * INTERDICTION ABSOLUE d'écrire une donnée sensible dans `AsyncStorage` —
 * il n'est ni chiffré ni protégé par le système (plist / SharedPreferences
 * en clair). Toute donnée qui touche au verrou de mode enfant passe par ce
 * module : le hash du code parent, le compteur d'échecs, l'échéance du
 * blocage, l'horodatage anti-recul d'horloge, le mode courant de
 * l'application (parent/enfant — son intégrité fait partie du périmètre de
 * sécurité, même si sa valeur n'est pas confidentielle : une valeur
 * modifiable via un stockage non protégé serait un contournement direct du
 * verrou) et le drapeau « appareil du parent ».
 *
 * Les clés sont énumérées ici pour qu'aucun appelant n'invente sa propre
 * chaîne — une faute de frappe dans une clé stringifiée à la main est le
 * genre de bug qui ne se voit qu'en production.
 */
export const SecureStoreKey = {
  parentCodeHash: 'nurtura.auth.parentCodeHash',
  parentCodeSalt: 'nurtura.auth.parentCodeSalt',
  failedAttempts: 'nurtura.lock.failedAttempts',
  lockoutUntil: 'nurtura.lock.lockoutUntil',
  lastKnownTime: 'nurtura.lock.lastKnownTime',
  isParentDevice: 'nurtura.device.isParentDevice',
  appMode: 'nurtura.mode.current',
  activeChildId: 'nurtura.mode.activeChildId',
  /**
   * DÉVELOPPEMENT UNIQUEMENT — code parent stocké tel quel, en attendant la
   * décision sur la dérivation de clé (src/features/auth/parentCode.ts).
   * Lu et écrit seulement par devParentCodeStore.ts, qui refuse de tourner
   * hors de `__DEV__`.
   */
  devParentCode: 'nurturia.dev.parentCode',
} as const;

export type SecureStoreKeyName = (typeof SecureStoreKey)[keyof typeof SecureStoreKey];

export async function getSecureItem(key: SecureStoreKeyName): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: SecureStoreKeyName, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: SecureStoreKeyName): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function isSecureStoreAvailable(): Promise<boolean> {
  return SecureStore.isAvailableAsync();
}
