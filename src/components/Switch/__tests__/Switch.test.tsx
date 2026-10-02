import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Switch } from '../Switch';

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function Harness(): React.JSX.Element {
  const [value, setValue] = useState(false);
  return (
    <ThemeProvider>
      <Switch value={value} onValueChange={setValue} accessibilityLabel="Saisie vocale" />
    </ThemeProvider>
  );
}

describe('Switch', () => {
  it('expose le rôle switch et bascule checked à l’appui', async () => {
    const { getByRole } = render(<Harness />);
    await flush();

    const node = getByRole('switch', { name: 'Saisie vocale' });
    expect(node.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

    fireEvent.press(node);
    expect(getByRole('switch', { name: 'Saisie vocale' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
  });

  it('désactivé : explique pourquoi et ne change pas de valeur', async () => {
    const onValueChange = jest.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Switch
          value={false}
          onValueChange={onValueChange}
          accessibilityLabel="Photo de l'énoncé"
          disabled
          disabledReason="Autorisez l'appareil photo dans les réglages du téléphone"
        />
      </ThemeProvider>,
    );
    await flush();

    const node = getByRole('switch', { name: "Photo de l'énoncé" });
    expect(node.props.accessibilityHint).toBe("Autorisez l'appareil photo dans les réglages du téléphone");
    fireEvent.press(node);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
