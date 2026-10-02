import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Chip, ChipRow } from '../Chip';

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function Harness(): React.JSX.Element {
  const [selected, setSelected] = useState<string>('Maths');
  return (
    <ThemeProvider>
      <ChipRow accessibilityLabel="Matière" testID="row">
        {['Maths', 'Français', 'Sciences'].map((subject) => (
          <Chip key={subject} label={subject} selected={subject === selected} onPress={() => setSelected(subject)} />
        ))}
      </ChipRow>
    </ThemeProvider>
  );
}

describe('Chip', () => {
  it('place les chips sur une seule rangée qui défile horizontalement', async () => {
    const { getByTestId } = render(<Harness />);
    await flush();
    expect(getByTestId('row').props.horizontal).toBe(true);
  });

  it('expose un togglebutton dont checked suit la sélection', async () => {
    const { getByRole } = render(<Harness />);
    await flush();
    expect(getByRole('togglebutton', { name: 'Maths' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );

    fireEvent.press(getByRole('togglebutton', { name: 'Sciences' }));
    expect(getByRole('togglebutton', { name: 'Sciences' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );
    expect(getByRole('togglebutton', { name: 'Maths' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });
});
