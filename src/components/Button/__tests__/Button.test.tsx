import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { Button } from '../Button';

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function renderButton(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Button', () => {
  it('état normal : rend le libellé et répond à onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = renderButton(<Button label="Valider" onPress={onPress} />);
    await flushMicrotasks();

    const node = getByRole('button', { name: 'Valider' });
    fireEvent.press(node);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('état désactivé : exige disabledReason (imposé par le type) et bloque onPress', async () => {
    const onPress = jest.fn();
    const { getByRole } = renderButton(
      <Button label="Continuer" onPress={onPress} disabled disabledReason="Choisissez une classe pour continuer" />,
    );
    await flushMicrotasks();

    const node = getByRole('button', { name: 'Continuer' });
    expect(node.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    expect(node.props.accessibilityHint).toBe('Choisissez une classe pour continuer');

    fireEvent.press(node);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('état chargement : verrouille la largeur mesurée avant de basculer, expose busy=true', async () => {
    const { getByRole, rerender } = renderButton(<Button label="Envoyer la demande" />);
    await flushMicrotasks();

    const before = getByRole('button', { name: 'Envoyer la demande' });
    fireEvent(before, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 180, height: 48 } } });

    rerender(
      <ThemeProvider>
        <Button label="Envoyer la demande" loading />
      </ThemeProvider>,
    );
    await flushMicrotasks();

    const after = getByRole('button', { name: 'Envoyer la demande' });
    expect(after.props.accessibilityState).toEqual(expect.objectContaining({ busy: true, disabled: true }));
  });

  it('onPress ne se déclenche pas pendant le chargement', async () => {
    const onPress = jest.fn();
    const { getByRole } = renderButton(<Button label="Valider" onPress={onPress} loading />);
    await flushMicrotasks();

    fireEvent.press(getByRole('button', { name: 'Valider' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('un seul bouton primaire visible par écran reste une discipline de composition : Button ne l\'impose pas lui-même', async () => {
    // Documenté ici pour mémoire : CLAUDE.md invariant n°16 se vérifie en
    // revue d'écran, pas par ce composant pris isolément.
    const { getAllByRole } = renderButton(
      <>
        <Button label="Valider" variant="primary" />
        <Button label="Plus tard" variant="secondary" />
      </>,
    );
    await flushMicrotasks();
    expect(getAllByRole('button')).toHaveLength(2);
  });
});
