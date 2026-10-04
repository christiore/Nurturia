import { deleteSecureItem, getSecureItem, setSecureItem, SecureStoreKey } from '../../services/secureStore';
import { isBlacklistedParentCode, PARENT_CODE_LENGTH, type ParentCodeContext } from './parentCode';

/**
 * ⚠ STOCKAGE FACTICE, DÉVELOPPEMENT UNIQUEMENT ⚠
 *
 * Le code parent ne doit jamais être stocké en clair (CLAUDE.md §6). La
 * dérivation de clé n'est pas tranchée (choix du 4 octobre : « pas
 * maintenant », voir `hashParentCode` dans parentCode.ts). Pour tester le
 * parcours dans Expo Go, ce module garde le code tel quel dans le stockage
 * sécurisé de l'appareil, et **refuse de fonctionner hors de `__DEV__`** :
 * un build de production qui l'appellerait échoue au lieu de stocker un code
 * en clair.
 *
 * Le jour où la dérivation est décidée, on remplace ce module par une
 * implémentation qui garde la même interface (`ParentCodeStore`).
 */
export type ParentCodeStore = {
  hasParentCode: () => Promise<boolean>;
  /** Renvoie `rejected` si le code est trop facile à deviner (liste noire). */
  createParentCode: (code: string, context?: ParentCodeContext) => Promise<'created' | 'rejected'>;
  verifyParentCode: (code: string) => Promise<boolean>;
  /** Pour le parcours « Code oublié » et les tests. */
  clearParentCode: () => Promise<void>;
};

function assertDevelopment(): void {
  if (!__DEV__) {
    throw new Error(
      'devParentCodeStore : stockage factice du code parent appelé hors du mode développement. ' +
        'Implémenter la dérivation de clé (parentCode.ts) avant tout build de production.',
    );
  }
}

function assertSixDigits(code: string): void {
  if (!new RegExp(`^\\d{${PARENT_CODE_LENGTH}}$`).test(code)) {
    throw new Error(`Le code parent doit compter ${PARENT_CODE_LENGTH} chiffres`);
  }
}

export const devParentCodeStore: ParentCodeStore = {
  async hasParentCode() {
    assertDevelopment();
    return (await getSecureItem(SecureStoreKey.devParentCode)) !== null;
  },

  async createParentCode(code, context = {}) {
    assertDevelopment();
    assertSixDigits(code);
    if (isBlacklistedParentCode(code, context)) {
      return 'rejected';
    }
    await setSecureItem(SecureStoreKey.devParentCode, code);
    return 'created';
  },

  async verifyParentCode(code) {
    assertDevelopment();
    assertSixDigits(code);
    return (await getSecureItem(SecureStoreKey.devParentCode)) === code;
  },

  async clearParentCode() {
    assertDevelopment();
    await deleteSecureItem(SecureStoreKey.devParentCode);
  },
};
