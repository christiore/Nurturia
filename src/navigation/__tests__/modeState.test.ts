import { DEFAULT_MODE_STATE, persistModeState, restoreModeState } from '../modeState';
import { SecureStoreKey } from '../../services/secureStore';

jest.mock('../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../services/__mocks__/secureStore')>('../../services/secureStore');

beforeEach(() => {
  __resetSecureStore();
});

describe('restauration du mode au lancement', () => {
  it('sans rien de persisté, retombe sur le mode parent par défaut', async () => {
    const state = await restoreModeState();
    expect(state).toEqual(DEFAULT_MODE_STATE);
  });

  it("« l'application rouvre dans le mode où elle a été fermée » : le mode parent persisté est restauré", async () => {
    await persistModeState({ mode: 'parent', activeChildId: null });
    const state = await restoreModeState();
    expect(state).toEqual({ mode: 'parent', activeChildId: null });
  });

  it('le mode enfant persisté, avec son enfant actif, est restauré à l\'identique', async () => {
    await persistModeState({ mode: 'child', activeChildId: 'lea-1' });
    const state = await restoreModeState();
    expect(state).toEqual({ mode: 'child', activeChildId: 'lea-1' });
  });

  it("une valeur de mode corrompue en stockage retombe sur le défaut plutôt que de planter", async () => {
    const { setSecureItem } =
      jest.requireMock<typeof import('../../services/__mocks__/secureStore')>('../../services/secureStore');
    await setSecureItem(SecureStoreKey.appMode, 'not-a-mode');
    const state = await restoreModeState();
    expect(state).toEqual(DEFAULT_MODE_STATE);
  });

  it('repasser en mode parent efface l\'enfant actif mémorisé', async () => {
    await persistModeState({ mode: 'child', activeChildId: 'lea-1' });
    await persistModeState({ mode: 'parent', activeChildId: null });
    const state = await restoreModeState();
    expect(state).toEqual({ mode: 'parent', activeChildId: null });
  });
});
