import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { ModeProvider, useModeState } from '../ModeProvider';
import { persistModeState } from '../modeState';

jest.mock('../../services/secureStore');

const { __resetSecureStore } =
  jest.requireMock<typeof import('../../services/__mocks__/secureStore')>('../../services/secureStore');

beforeEach(() => {
  __resetSecureStore();
});

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function ModeProbe(): React.JSX.Element {
  const { mode, activeChildId } = useModeState();
  return <Text testID="probe">{`${mode}:${activeChildId ?? 'none'}`}</Text>;
}

describe('ModeProvider — restauration avant tout rendu', () => {
  it('ne monte pas les enfants tant que la restauration est en cours', async () => {
    const { queryByTestId } = render(
      <ModeProvider>
        <ModeProbe />
      </ModeProvider>,
    );
    // Synchrone, avant que la promesse de restauration n'ait pu se résoudre.
    expect(queryByTestId('probe')).toBeNull();
    // Laisse la restauration se terminer sous act() pour ne pas polluer le test suivant.
    await flushMicrotasks();
  });

  it('monte les enfants avec le mode restauré une fois la lecture terminée', async () => {
    await persistModeState({ mode: 'child', activeChildId: 'lea-1' });

    const { findByTestId } = render(
      <ModeProvider>
        <ModeProbe />
      </ModeProvider>,
    );

    const probe = await findByTestId('probe');
    expect(probe.props.children).toBe('child:lea-1');
  });

  it("affiche le fallback fourni pendant la restauration, jamais children", async () => {
    const { getByTestId, findByTestId } = render(
      <ModeProvider fallback={<Text testID="fallback">…</Text>}>
        <ModeProbe />
      </ModeProvider>,
    );
    expect(getByTestId('fallback')).toBeTruthy();
    await findByTestId('probe');
    await flushMicrotasks();
  });
});
