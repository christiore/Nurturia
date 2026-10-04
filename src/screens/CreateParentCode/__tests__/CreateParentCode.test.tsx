import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { devParentCodeStore } from '../../../features/auth/devParentCodeStore';
import { renderScreen } from '../../../testUtils/renderScreen';
import { CreateParentCode } from '../index';

jest.mock('../../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../../services/__mocks__/secureStore')>('../../../services/secureStore');

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

beforeEach(() => {
  __resetSecureStore();
});

describe('CreateParentCode', () => {
  it('saisie puis confirmation identique : le code est créé', async () => {
    const onCreated = jest.fn();
    renderScreen(<CreateParentCode onCreated={onCreated} onCancel={jest.fn()} />);
    await type('583920');
    expect(screen.getByText('Saisissez le code une seconde fois')).toBeTruthy();
    await type('583920');
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(await devParentCodeStore.verifyParentCode('583920')).toBe(true);
  });

  it('deux saisies différentes : on recommence depuis le début', async () => {
    const onCreated = jest.fn();
    renderScreen(<CreateParentCode onCreated={onCreated} onCancel={jest.fn()} />);
    await type('583920');
    await type('583921');
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByText('Créez votre code parent')).toBeTruthy();
    expect(screen.getByText(/Les deux saisies sont différentes/)).toBeTruthy();
  });

  it('un code trop facile est refusé et rien n’est enregistré', async () => {
    const onCreated = jest.fn();
    renderScreen(<CreateParentCode onCreated={onCreated} onCancel={jest.fn()} />);
    await type('123456');
    await type('123456');
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByText(/trop facile à deviner/)).toBeTruthy();
    expect(await devParentCodeStore.hasParentCode()).toBe(false);
  });
});
