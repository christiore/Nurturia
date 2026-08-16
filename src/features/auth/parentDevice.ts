import { getSecureItem, setSecureItem, SecureStoreKey } from '../../services/secureStore';

/**
 * Biométrie conditionnelle — CLAUDE.md §6 : sur un appareil familial où
 * l'enfant a enregistré son visage, la biométrie ouvrirait le mode parent
 * À L'ENFANT si elle n'était pas conditionnée à ce drapeau.
 *
 * Aucun appel `expo-local-authentication` n'est fait dans cette session
 * (pas d'écran de verrou construit ici) : `canUseBiometricUnlock` est le
 * point de passage obligé que ce futur appel devra vérifier en premier,
 * avant même de proposer Face ID / empreinte à l'écran.
 */

export async function isParentDevice(): Promise<boolean> {
  return (await getSecureItem(SecureStoreKey.isParentDevice)) === 'true';
}

export async function setIsParentDevice(value: boolean): Promise<void> {
  await setSecureItem(SecureStoreKey.isParentDevice, value ? 'true' : 'false');
}

export async function canUseBiometricUnlock(): Promise<boolean> {
  return isParentDevice();
}
