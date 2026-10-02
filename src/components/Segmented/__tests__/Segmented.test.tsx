import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Segmented } from '../Segmented';

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function Harness(): React.JSX.Element {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  return (
    <ThemeProvider>
      <Segmented
        accessibilityLabel="Période affichée"
        options={[
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
        ]}
        value={period}
        onChange={setPeriod}
        testID="segmented"
      />
    </ThemeProvider>
  );
}

describe('Segmented', () => {
  it('expose un radiogroup nommé dont le conteneur fait au moins 48', async () => {
    const { getByTestId } = render(<Harness />);
    await flush();
    const container = getByTestId('segmented');
    expect(container.props.accessibilityRole).toBe('radiogroup');
    expect(container.props.accessibilityLabel).toBe('Période affichée');
    expect(container.props.style.minHeight).toBeGreaterThanOrEqual(48);
  });

  it('coche le segment choisi et décoche les autres', async () => {
    const { getByRole } = render(<Harness />);
    await flush();
    expect(getByRole('radio', { name: 'Semaine' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );

    fireEvent.press(getByRole('radio', { name: 'Mois' }));
    expect(getByRole('radio', { name: 'Mois' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
    expect(getByRole('radio', { name: 'Semaine' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });
});
