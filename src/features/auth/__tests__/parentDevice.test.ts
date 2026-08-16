import { canUseBiometricUnlock, isParentDevice, setIsParentDevice } from '../parentDevice';

jest.mock('../../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../../services/__mocks__/secureStore')>('../../../services/secureStore');

beforeEach(() => {
  __resetSecureStore();
});

describe('biométrie conditionnelle', () => {
  it("un appareil non marqué n'autorise pas la biométrie", async () => {
    expect(await isParentDevice()).toBe(false);
    expect(await canUseBiometricUnlock()).toBe(false);
  });

  it("marquer l'appareil comme appareil du parent autorise la biométrie", async () => {
    await setIsParentDevice(true);
    expect(await isParentDevice()).toBe(true);
    expect(await canUseBiometricUnlock()).toBe(true);
  });

  it('le drapeau peut être révoqué', async () => {
    await setIsParentDevice(true);
    await setIsParentDevice(false);
    expect(await canUseBiometricUnlock()).toBe(false);
  });
});
