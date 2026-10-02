import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../../theme/ThemeProvider';
import { AsyncList, type AsyncListState } from '../AsyncList';
import { ListGroup } from '../ListGroup';
import { ListLeading, ListRow } from '../ListRow';

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function wrap(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ListRow', () => {
  it('ligne cliquable : bouton dont le nom réunit titre et sous-titre', async () => {
    const onPress = jest.fn();
    const { getByRole } = wrap(
      <ListRow
        title="Fractions"
        subtitle="14 min · a cherché seule 6 min"
        leading={<ListLeading subjectKey="maths" />}
        onPress={onPress}
      />,
    );
    await flush();

    const row = getByRole('button', { name: 'Fractions, 14 min · a cherché seule 6 min' });
    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ligne de données : pas de bouton, la valeur est lue avec le titre', async () => {
    const { queryByRole, getByLabelText } = wrap(<ListRow title="Sessions cette semaine" value="3" />);
    await flush();

    expect(queryByRole('button')).toBeNull();
    expect(getByLabelText('Sessions cette semaine, 3')).toBeTruthy();
  });
});

describe('ListGroup', () => {
  it('affiche l’en-tête de section comme titre', async () => {
    const { getByRole } = wrap(
      <ListGroup title="Cette semaine">
        <ListRow title="Lundi" />
        <ListRow title="Mardi" />
      </ListGroup>,
    );
    await flush();
    expect(getByRole('header', { name: 'Cette semaine' })).toBeTruthy();
  });
});

type Session = { id: string; title: string };

function renderList(state: AsyncListState<Session>, overrides: { onRetry?: () => void; onEmptyAction?: () => void } = {}) {
  return wrap(
    <AsyncList
      testID="list"
      state={state}
      keyExtractor={(item) => item.id}
      renderItem={(item) => <ListRow title={item.title} />}
      empty={{
        title: 'Pas encore de session',
        body: 'La première session apparaîtra ici.',
        action: { label: 'Passer en mode enfant', onPress: overrides.onEmptyAction ?? (() => undefined) },
      }}
      error={{
        title: 'La liste ne s’affiche pas pour le moment',
        body: 'Vérifiez la connexion, puis réessayez.',
        onRetry: overrides.onRetry ?? (() => undefined),
      }}
    />,
  );
}

describe('AsyncList — les quatre états', () => {
  it('chargement : skeletons annoncés une seule fois, pas de contenu', async () => {
    const { getByTestId, queryByText } = renderList({ status: 'loading' });
    await flush();

    const loading = getByTestId('list-loading');
    expect(loading.props.accessibilityLabel).toBe('Chargement en cours');
    expect(loading.props.accessibilityState).toEqual(expect.objectContaining({ busy: true }));
    expect(queryByText('Pas encore de session')).toBeNull();
  });

  it('vide : titre, phrase et action', async () => {
    const onEmptyAction = jest.fn();
    const { getByText, getByRole } = renderList({ status: 'ready', items: [] }, { onEmptyAction });
    await flush();

    expect(getByText('Pas encore de session')).toBeTruthy();
    fireEvent.press(getByRole('button', { name: 'Passer en mode enfant' }));
    expect(onEmptyAction).toHaveBeenCalledTimes(1);
  });

  it('erreur : message qui dit quoi faire et bouton Réessayer', async () => {
    const onRetry = jest.fn();
    const { getByText, getByRole } = renderList({ status: 'error' }, { onRetry });
    await flush();

    expect(getByText('Vérifiez la connexion, puis réessayez.')).toBeTruthy();
    fireEvent.press(getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('plein : une ligne par élément, indicateur en pied pendant le chargement de la suite', async () => {
    const { getByText, queryByText, getByLabelText } = renderList({
      status: 'ready',
      items: [
        { id: '1', title: 'Lundi' },
        { id: '2', title: 'Mardi' },
      ],
      loadingMore: true,
    });
    await flush();

    expect(getByText('Lundi')).toBeTruthy();
    expect(getByText('Mardi')).toBeTruthy();
    expect(queryByText('Pas encore de session')).toBeNull();
    expect(getByLabelText('Chargement en cours')).toBeTruthy();
  });
});
