import React, { useCallback, useEffect, useState } from 'react';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/Button/Button';
import { EmptyState, ErrorState } from '../../components/EmptyState/EmptyState';
import { ListGroup } from '../../components/List/ListGroup';
import { RadioCardGroup } from '../../components/RadioCard/RadioCard';
import { Screen } from '../../components/Screen/Screen';
import { ListRowSkeleton, SkeletonGroup } from '../../components/Skeleton/Skeleton';
import { childrenService, type ChildProfile, type ChildrenService } from '../../services/children';
import { t } from '../../i18n';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; children: readonly ChildProfile[] };

export type ChooseChildProps = {
  onConfirm: (childId: string) => void;
  onCancel: () => void;
  service?: ChildrenService;
};

/**
 * Feuille « Qui va utiliser l'app ? » avant la bascule en mode enfant
 * (PARCOURS.md §2, phase 3). C'est une liste chargée : ses quatre états sont
 * implémentés (invariant n°12).
 */
export function ChooseChild({ onConfirm, onCancel, service = childrenService }: ChooseChildProps): React.JSX.Element {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    service
      .listChildren()
      .then((children) => {
        if (!mounted) return;
        setState({ status: 'ready', children });
        // Un seul enfant : déjà sélectionné, un appui de moins.
        if (children.length === 1) setSelectedId(children[0]?.id);
      })
      .catch(() => {
        if (mounted) setState({ status: 'error' });
      });
    return () => {
      mounted = false;
    };
  }, [service, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const canConfirm = state.status === 'ready' && selectedId !== undefined;

  return (
    <Screen
      footer={
        state.status === 'ready' && state.children.length > 0 ? (
          <>
            {canConfirm ? (
              <Button
                label={t('chooseChild.confirm')}
                variant="primary"
                size="lg"
                onPress={() => selectedId && onConfirm(selectedId)}
              />
            ) : (
              <Button
                label={t('chooseChild.confirm')}
                variant="primary"
                size="lg"
                disabled
                disabledReason={t('chooseChild.confirmDisabledReason')}
              />
            )}
            <Button label={t('common.cancel')} variant="ghost" onPress={onCancel} />
          </>
        ) : null
      }
    >
      <Text variant="h1" color="textPrimary" accessibilityRole="header">
        {t('chooseChild.title')}
      </Text>

      {state.status === 'loading' ? (
        <SkeletonGroup accessibilityLabel={t('common.loading')}>
          <ListGroup>
            <ListRowSkeleton withLeading={false} />
            <ListRowSkeleton withLeading={false} />
          </ListGroup>
        </SkeletonGroup>
      ) : null}

      {state.status === 'error' ? (
        <ErrorState title={t('chooseChild.errorTitle')} body={t('chooseChild.errorBody')} onRetry={retry} />
      ) : null}

      {state.status === 'ready' && state.children.length === 0 ? (
        <EmptyState
          title={t('chooseChild.emptyTitle')}
          body={t('chooseChild.emptyBody')}
          action={{ label: t('common.close'), onPress: onCancel }}
        />
      ) : null}

      {state.status === 'ready' && state.children.length > 0 ? (
        <Box gap={4}>
          <RadioCardGroup
            accessibilityLabel={t('chooseChild.title')}
            value={selectedId}
            onChange={setSelectedId}
            options={state.children.map((child) => ({
              value: child.id,
              label: child.firstName,
              description: t('chooseChild.gradeLabel', { grade: child.grade }),
            }))}
          />
          <Text variant="caption" color="textSecondary">
            {t('chooseChild.lockNote')}
          </Text>
        </Box>
      ) : null}
    </Screen>
  );
}
