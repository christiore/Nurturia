import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Skeleton } from '../Skeleton';

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('Skeleton', () => {
  afterEach(() => jest.restoreAllMocks());

  it('pulse par défaut', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const loop = jest.spyOn(Animated, 'loop');
    const { unmount } = render(
      <ThemeProvider>
        <Skeleton width={120} height={16} />
      </ThemeProvider>,
    );
    await flush();
    expect(loop).toHaveBeenCalled();
    unmount();
  });

  it('ne pulse pas quand la réduction des animations est active (invariant n°15)', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { unmount } = render(
      <ThemeProvider>
        <Skeleton width={120} height={16} />
      </ThemeProvider>,
    );
    await flush();
    const loop = jest.spyOn(Animated, 'loop');
    // Après la résolution de la préférence, aucune nouvelle boucle n'est lancée.
    await flush();
    expect(loop).not.toHaveBeenCalled();
    unmount();
  });
});
