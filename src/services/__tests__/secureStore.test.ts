import * as SecureStore from 'expo-secure-store';

import { deleteSecureItem, getSecureItem, isSecureStoreAvailable, SecureStoreKey, setSecureItem } from '../secureStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
}));

describe('secureStore', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('délègue getSecureItem à SecureStore.getItemAsync avec la clé exacte', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valeur');
    const result = await getSecureItem(SecureStoreKey.parentCodeHash);
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(SecureStoreKey.parentCodeHash);
    expect(result).toBe('valeur');
  });

  it('délègue setSecureItem à SecureStore.setItemAsync', async () => {
    await setSecureItem(SecureStoreKey.failedAttempts, '3');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SecureStoreKey.failedAttempts, '3');
  });

  it('délègue deleteSecureItem à SecureStore.deleteItemAsync', async () => {
    await deleteSecureItem(SecureStoreKey.lockoutUntil);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SecureStoreKey.lockoutUntil);
  });

  it('délègue isSecureStoreAvailable à SecureStore.isAvailableAsync', async () => {
    (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    expect(await isSecureStoreAvailable()).toBe(true);
  });

  it('les clés sont toutes distinctes (aucune collision de stockage)', () => {
    const values = Object.values(SecureStoreKey);
    expect(new Set(values).size).toBe(values.length);
  });
});
