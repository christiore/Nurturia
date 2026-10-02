import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { RadioCardGroup, type RadioOption } from '../RadioCard';

type Slot = 'afterSchool' | 'wednesday' | 'custom';

const OPTIONS: readonly RadioOption<Slot>[] = [
  { value: 'afterSchool', label: "Après l'école", description: '17h – 19h' },
  { value: 'wednesday', label: 'Mercredi après-midi' },
  { value: 'custom', label: 'Personnaliser' },
];

function Harness({ onChange }: { onChange?: (value: Slot) => void }): React.JSX.Element {
  const [value, setValue] = useState<Slot | undefined>(undefined);
  return (
    <ThemeProvider>
      <RadioCardGroup
        accessibilityLabel="Quand Léa peut-elle utiliser l'app ?"
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        testID="group"
      />
    </ThemeProvider>
  );
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('RadioCardGroup', () => {
  it('expose un radiogroup nommé et une option radio par carte', async () => {
    const { getByTestId, getAllByRole } = render(<Harness />);
    await flush();
    expect(getByTestId('group').props.accessibilityRole).toBe('radiogroup');
    expect(getAllByRole('radio')).toHaveLength(3);
  });

  it('inclut la précision dans le nom accessible', async () => {
    const { getByRole } = render(<Harness />);
    await flush();
    expect(getByRole('radio', { name: "Après l'école, 17h – 19h" })).toBeTruthy();
  });

  it('sélectionne une seule carte à la fois et le signale par checked', async () => {
    const onChange = jest.fn();
    const { getByRole } = render(<Harness onChange={onChange} />);
    await flush();

    fireEvent.press(getByRole('radio', { name: 'Mercredi après-midi' }));
    expect(onChange).toHaveBeenCalledWith('wednesday');
    expect(getByRole('radio', { name: 'Mercredi après-midi' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true }),
    );

    fireEvent.press(getByRole('radio', { name: 'Personnaliser' }));
    expect(getByRole('radio', { name: 'Mercredi après-midi' }).props.accessibilityState).toEqual(
      expect.objectContaining({ checked: false }),
    );
  });
});
