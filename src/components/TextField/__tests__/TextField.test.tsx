import React, { useState } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { TextField, type TextFieldProps } from '../TextField';

const REQUIRED_MESSAGE = 'Indiquez une adresse e-mail pour recevoir le lien';

function validateEmail(value: string): string | undefined {
  return value.includes('@') ? undefined : REQUIRED_MESSAGE;
}

function Harness(props: Partial<TextFieldProps>): React.JSX.Element {
  const [value, setValue] = useState('');
  return (
    <ThemeProvider>
      <TextField
        label="Adresse e-mail"
        value={value}
        onChangeText={setValue}
        keyboardType="email-address"
        returnKeyType="done"
        autoComplete="email"
        textContentType="emailAddress"
        testID="field"
        {...props}
      />
    </ThemeProvider>
  );
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('TextField', () => {
  it('garde le label visible et l’utilise comme nom accessible', async () => {
    const { getByText, getByTestId } = render(<Harness placeholder="vous@exemple.fr" />);
    await flush();
    expect(getByText('Adresse e-mail')).toBeTruthy();
    expect(getByTestId('field').props.accessibilityLabel).toBe('Adresse e-mail');
  });

  it('ne valide pas à la frappe tant que le champ n’a pas perdu le focus', async () => {
    const { getByTestId, queryByText } = render(<Harness validate={validateEmail} />);
    await flush();
    fireEvent.changeText(getByTestId('field'), 'cla');
    expect(queryByText(REQUIRED_MESSAGE)).toBeNull();
  });

  it('valide au blur, puis se revalide à chaque frappe une fois en erreur', async () => {
    const { getByTestId, queryByText } = render(<Harness validate={validateEmail} />);
    await flush();
    const field = getByTestId('field');

    fireEvent.changeText(field, 'claire');
    fireEvent(field, 'blur');
    expect(queryByText(REQUIRED_MESSAGE)).toBeTruthy();
    expect(field.props.accessibilityHint).toBe(REQUIRED_MESSAGE);

    fireEvent.changeText(field, 'claire@exemple.fr');
    expect(queryByText(REQUIRED_MESSAGE)).toBeNull();
  });

  it('affiche l’aide quand il n’y a pas d’erreur, et l’erreur imposée en priorité', async () => {
    const { getByText, queryByText, rerender } = render(<Harness helper="Vous recevrez un lien et un code." />);
    await flush();
    expect(getByText('Vous recevrez un lien et un code.')).toBeTruthy();

    rerender(<Harness helper="Vous recevrez un lien et un code." error="Vérifiez la connexion puis réessayez" />);
    expect(getByText('Vérifiez la connexion puis réessayez')).toBeTruthy();
    expect(queryByText('Vous recevrez un lien et un code.')).toBeNull();
  });

  it('autorise la mise à l’échelle de la police et un champ qui grandit', async () => {
    const { getByTestId } = render(<Harness />);
    await flush();
    const field = getByTestId('field');
    expect(field.props.allowFontScaling).toBe(true);
    expect(field.props.style.height).toBeUndefined();
    expect(field.props.style.minHeight).toBeGreaterThanOrEqual(48);
  });
});
