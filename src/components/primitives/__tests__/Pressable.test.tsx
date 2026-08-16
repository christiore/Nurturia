import React from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { touch } from '../../../theme/theme';
import { computeHitSlop, Pressable } from '../Pressable';

// Pressable résout AccessibilityInfo.isReduceMotionEnabled() de façon
// asynchrone au montage ; on laisse cette microtâche se terminer sous act()
// avant d'asserter, sinon React avertit d'une mise à jour hors act().
async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('computeHitSlop', () => {
  it('renvoie undefined tant que la taille n\'a pas été mesurée', () => {
    expect(computeHitSlop(null)).toBeUndefined();
  });

  it("n'étend rien pour un contenu déjà à la cible minimale", () => {
    expect(computeHitSlop({ width: touch.min, height: touch.min })).toBeUndefined();
  });

  it('étend symétriquement un contenu plus petit que la cible minimale (ex. icône 24)', () => {
    const size = 24;
    const hitSlop = computeHitSlop({ width: size, height: size });
    const expectedPerSide = (touch.min - size) / 2;
    expect(hitSlop).toEqual({
      top: expectedPerSide,
      bottom: expectedPerSide,
      left: expectedPerSide,
      right: expectedPerSide,
    });
  });

  it('agrandit la zone tactile jusqu\'à au moins touch.min, jamais moins', () => {
    const size = 24;
    const hitSlop = computeHitSlop({ width: size, height: size });
    expect(hitSlop).toBeDefined();
    if (hitSlop) {
      expect(size + hitSlop.left + hitSlop.right).toBeGreaterThanOrEqual(touch.min);
      expect(size + hitSlop.top + hitSlop.bottom).toBeGreaterThanOrEqual(touch.min);
    }
  });

  it('gère les dimensions asymétriques indépendamment', () => {
    const hitSlop = computeHitSlop({ width: 40, height: 20 });
    expect(hitSlop).toEqual({ top: 14, bottom: 14, left: 4, right: 4 });
  });
});

describe('Pressable', () => {
  it('applique un accessibilityLabel, accessibilityRole et accessibilityState', async () => {
    const { getByRole } = render(
      <Pressable accessibilityLabel="Fermer" disabled={false} onPress={() => undefined}>
        <></>
      </Pressable>,
    );
    await flushMicrotasks();
    const node = getByRole('button', { name: 'Fermer' });
    expect(node.props.accessibilityState).toEqual(expect.objectContaining({ disabled: false }));
  });

  it('étend hitSlop après mesure du layout pour un contenu sous 48px', async () => {
    const { getByTestId } = render(
      <Pressable accessibilityLabel="Micro" testID="pressable">
        <></>
      </Pressable>,
    );
    await flushMicrotasks();
    expect(getByTestId('pressable').props.hitSlop).toBeUndefined();

    fireEvent(getByTestId('pressable'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 24, height: 24 } } });

    expect(getByTestId('pressable').props.hitSlop).toEqual({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
    });
  });

  it('appelle onPress', async () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Pressable accessibilityLabel="Valider" onPress={onPress} testID="pressable">
        <></>
      </Pressable>,
    );
    await flushMicrotasks();
    fireEvent.press(getByTestId('pressable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("n'anime pas quand la réduction de mouvement est active", async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const timingSpy = jest.spyOn(Animated, 'timing');

    const { getByTestId } = render(
      <Pressable accessibilityLabel="Continuer" testID="pressable">
        <></>
      </Pressable>,
    );
    await flushMicrotasks();
    fireEvent(getByTestId('pressable'), 'pressIn');

    expect(timingSpy).not.toHaveBeenCalled();
    timingSpy.mockRestore();
  });
});
