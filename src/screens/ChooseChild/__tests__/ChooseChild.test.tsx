import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import type { ChildProfile, ChildrenService } from '../../../services/children';
import { renderScreen } from '../../../testUtils/renderScreen';
import { ChooseChild } from '../index';

const LEA: ChildProfile = { id: 'lea', firstName: 'Léa', grade: '6e' };
const TOM: ChildProfile = { id: 'tom', firstName: 'Tom', grade: 'CM2' };

function serviceReturning(children: readonly ChildProfile[]): ChildrenService {
  return { listChildren: async () => children, getChild: async () => null };
}

async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
}

describe('ChooseChild — quatre états', () => {
  it('chargement : skeletons annoncés', () => {
    const pending: ChildrenService = { listChildren: () => new Promise(() => {}), getChild: async () => null };
    renderScreen(<ChooseChild onConfirm={jest.fn()} onCancel={jest.fn()} service={pending} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
  });

  it('vide : explique et propose de fermer', async () => {
    renderScreen(<ChooseChild onConfirm={jest.fn()} onCancel={jest.fn()} service={serviceReturning([])} />);
    await flush();
    expect(screen.getByText('Aucun enfant sur ce compte')).toBeTruthy();
  });

  it('erreur : Réessayer relance le chargement', async () => {
    const listChildren = jest.fn<Promise<readonly ChildProfile[]>, []>().mockRejectedValueOnce(new Error('réseau')).mockResolvedValue([LEA]);
    renderScreen(<ChooseChild onConfirm={jest.fn()} onCancel={jest.fn()} service={{ listChildren, getChild: async () => null }} />);
    await flush();
    expect(screen.getByText('La liste des enfants ne s’affiche pas')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    await flush();
    expect(listChildren).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Léa')).toBeTruthy();
  });

  it('plein : il faut choisir avant de confirmer', async () => {
    const onConfirm = jest.fn();
    renderScreen(<ChooseChild onConfirm={onConfirm} onCancel={jest.fn()} service={serviceReturning([LEA, TOM])} />);
    await flush();
    fireEvent.press(screen.getByRole('button', { name: /Passer en mode enfant/ }));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('radio', { name: /Tom/ }));
    fireEvent.press(screen.getByRole('button', { name: /Passer en mode enfant/ }));
    expect(onConfirm).toHaveBeenCalledWith('tom');
  });

  it('un seul enfant est présélectionné', async () => {
    const onConfirm = jest.fn();
    renderScreen(<ChooseChild onConfirm={onConfirm} onCancel={jest.fn()} service={serviceReturning([LEA])} />);
    await flush();
    fireEvent.press(screen.getByRole('button', { name: /Passer en mode enfant/ }));
    expect(onConfirm).toHaveBeenCalledWith('lea');
  });
});
