import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { devParentCodeStore } from '../../../features/auth/devParentCodeStore';
import { MAX_ATTEMPTS_BEFORE_LOCKOUT } from '../../../features/auth/lockout';
import { renderScreen } from '../../../testUtils/renderScreen';
import { ParentCodeEntry } from '../index';

jest.mock('../../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../../services/__mocks__/secureStore')>('../../../services/secureStore');

const CODE = '583920';
const WRONG = '583921';

async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
}

async function type(code: string): Promise<void> {
  for (const digit of code) {
    fireEvent.press(screen.getAllByLabelText(digit)[0]!);
  }
  await flush();
}

async function mount(onUnlocked = jest.fn()): Promise<jest.Mock> {
  renderScreen(<ParentCodeEntry childFirstName="Léa" onUnlocked={onUnlocked} onBack={jest.fn()} />);
  await flush();
  return onUnlocked;
}

beforeEach(async () => {
  __resetSecureStore();
  await devParentCodeStore.createParentCode(CODE);
});

describe('ParentCodeEntry — sortie du mode enfant', () => {
  it('le bon code déverrouille', async () => {
    const onUnlocked = await mount();
    await type(CODE);
    expect(onUnlocked).toHaveBeenCalledTimes(1);
  });

  it('un mauvais code ne déverrouille pas, vide la saisie et annonce les essais restants', async () => {
    const onUnlocked = await mount();
    await type(WRONG);
    expect(onUnlocked).not.toHaveBeenCalled();
    expect(screen.getByLabelText('0 chiffres saisis sur 6')).toBeTruthy();
    expect(screen.getByTestId('parent-code-message')).toHaveTextContent(
      `Ce code ne correspond pas. Encore ${MAX_ATTEMPTS_BEFORE_LOCKOUT - 1} essais avant une pause.`,
    );
  });

  it('après 5 échecs, la pause bloque même le bon code', async () => {
    const onUnlocked = await mount();
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) await type(WRONG);
    expect(screen.getByTestId('parent-code-message')).toHaveTextContent(/Pause en cours/);
    await type(CODE);
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it('la pause survit à un remontage de l’écran (relance de l’app)', async () => {
    await mount();
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) await type(WRONG);
    screen.unmount();

    const onUnlocked = await mount();
    expect(screen.getByTestId('parent-code-message')).toHaveTextContent(/Pause en cours/);
    await type(CODE);
    expect(onUnlocked).not.toHaveBeenCalled();
  });
});
