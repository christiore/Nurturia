import React from 'react';
import { Dimensions } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { layout } from '../../../theme/theme';
import { DevGallery } from '../index';

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function setWindowWidth(width: number): void {
  act(() => {
    Dimensions.set({
      window: { width, height: 800, scale: 1, fontScale: 1 },
      screen: { width, height: 800, scale: 1, fontScale: 1 },
    });
  });
}

function renderGallery() {
  return render(
    <ThemeProvider>
      <DevGallery />
    </ThemeProvider>,
  );
}

describe('DevGallery — rendu et disposition responsive', () => {
  afterEach(() => {
    setWindowWidth(390);
  });

  it('se monte sans planter avec le thème parent par défaut', async () => {
    const { getByText } = renderGallery();
    await flushMicrotasks();
    expect(getByText('Nurtura')).toBeTruthy();
  });

  it('la largeur de contenu est plafonnée par layout.contentMaxWidth (utile ≥ 840px, tablette)', async () => {
    const { getByTestId } = renderGallery();
    await flushMicrotasks();
    const content = getByTestId('dev-gallery-content');
    const flatStyle = Array.isArray(content.props.style) ? Object.assign({}, ...content.props.style) : content.props.style;
    expect(flatStyle.maxWidth).toBe(layout.contentMaxWidth);
    expect(flatStyle.width).toBe('100%');
    expect(flatStyle.alignSelf).toBe('center');
  });

  it('à 390pt (téléphone), le point de rupture rapporté est "compact"', async () => {
    setWindowWidth(390);
    const { getByText } = renderGallery();
    await flushMicrotasks();
    expect(getByText('compact')).toBeTruthy();
  });

  it('à 1024pt (tablette), le point de rupture rapporté est "expanded"', async () => {
    setWindowWidth(1024);
    const { getByText } = renderGallery();
    await flushMicrotasks();
    expect(getByText('expanded')).toBeTruthy();
  });

  it('le sélecteur de thème enfant/parent reste utilisable après bascule', async () => {
    const { getByRole } = renderGallery();
    await flushMicrotasks();

    fireEvent.press(getByRole('button', { name: 'Enfant' }));
    await flushMicrotasks();
    fireEvent.press(getByRole('button', { name: 'Parent' }));
    await flushMicrotasks();

    expect(getByRole('button', { name: 'Enfant' })).toBeTruthy();
    expect(getByRole('button', { name: 'Parent' })).toBeTruthy();
  });
});
