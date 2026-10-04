import { devParentCodeStore } from '../devParentCodeStore';

jest.mock('../../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../../services/__mocks__/secureStore')>('../../../services/secureStore');

const GOOD_CODE = '583920';

beforeEach(() => {
  __resetSecureStore();
});

describe('devParentCodeStore', () => {
  it('crée puis vérifie un code', async () => {
    expect(await devParentCodeStore.hasParentCode()).toBe(false);
    expect(await devParentCodeStore.createParentCode(GOOD_CODE)).toBe('created');
    expect(await devParentCodeStore.hasParentCode()).toBe(true);
    expect(await devParentCodeStore.verifyParentCode(GOOD_CODE)).toBe(true);
    expect(await devParentCodeStore.verifyParentCode('583921')).toBe(false);
  });

  it('refuse les codes de la liste noire sans les enregistrer', async () => {
    expect(await devParentCodeStore.createParentCode('123456')).toBe('rejected');
    expect(await devParentCodeStore.createParentCode('000000')).toBe('rejected');
    expect(await devParentCodeStore.hasParentCode()).toBe(false);
  });

  it('refuse la date de naissance de l’enfant', async () => {
    const context = { childBirthDate: { year: 2014, month: 3, day: 9 } };
    expect(await devParentCodeStore.createParentCode('090314', context)).toBe('rejected');
  });

  it('exige 6 chiffres', async () => {
    await expect(devParentCodeStore.createParentCode('1234')).rejects.toThrow();
  });

  it('refuse de fonctionner hors du mode développement', async () => {
    const globals = globalThis as unknown as { __DEV__: boolean };
    const previous = globals.__DEV__;
    globals.__DEV__ = false;
    try {
      await expect(devParentCodeStore.hasParentCode()).rejects.toThrow(/hors du mode développement/);
    } finally {
      globals.__DEV__ = previous;
    }
  });
});
