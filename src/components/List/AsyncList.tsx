import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, type ListRenderItemInfo } from 'react-native';

import { EmptyState, ErrorState, type EmptyStateProps, type ErrorStateProps } from '../EmptyState/EmptyState';
import { ListRowSkeleton, SkeletonGroup } from '../Skeleton/Skeleton';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, space } from '../../theme/theme';
import { t } from '../../i18n';
import { LIST_ROW_PADDING_H, LIST_ROW_TEXT_INSET } from './ListRow';
import { ListGroup, ListSeparator } from './ListGroup';

/**
 * L'état d'une liste chargée à distance. « Vide » n'est pas un état à part :
 * c'est `ready` avec zéro élément — l'appelant ne peut pas l'oublier.
 */
export type AsyncListState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      items: readonly T[];
      /** Pull-to-refresh en cours. */
      refreshing?: boolean;
      /** Page suivante en cours de chargement : indicateur en pied de liste. */
      loadingMore?: boolean;
    };

export type AsyncListProps<T> = {
  state: AsyncListState<T>;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  /**
   * Les trois états non pleins sont obligatoires : une liste sans ses quatre
   * états n'est pas terminée (CLAUDE.md, invariant n°12). Le type rend l'oubli
   * impossible plutôt que de compter sur la revue.
   */
  empty: EmptyStateProps;
  error: ErrorStateProps;
  /** Les lignes ont-elles une vignette ? Aligne le séparateur et le skeleton. */
  withLeading?: boolean;
  /** En-tête d'écran rendu dans la zone défilante, quel que soit l'état. */
  header?: React.ReactElement;
  onRefresh?: () => void;
  onEndReached?: () => void;
  /** Nombre de lignes fantômes pendant le chargement. */
  skeletonCount?: number;
  testID?: string;
};

/**
 * Liste groupée en carte avec ses quatre états (UI-GUIDELINES.md §6) :
 * chargement en skeletons, vide, erreur avec « Réessayer », pleine avec
 * pull-to-refresh et chargement progressif.
 *
 * Une seule `FlatList` porte les quatre états, pour que l'en-tête, le
 * défilement et le pull-to-refresh ne changent pas d'un état à l'autre. Les
 * lignes sont virtualisées : la carte est reconstituée ligne par ligne (fond,
 * coins arrondis sur la première et la dernière), sans l'ombre `s1` de
 * `ListGroup`, qu'on ne peut pas porter sur une liste découpée en cellules.
 */
export function AsyncList<T>({
  state,
  renderItem,
  keyExtractor,
  empty,
  error,
  withLeading = false,
  header,
  onRefresh,
  onEndReached,
  skeletonCount = 3,
  testID,
}: AsyncListProps<T>): React.JSX.Element {
  const { theme } = useTheme();
  const items = state.status === 'ready' ? state.items : [];
  const lastIndex = items.length - 1;
  const separatorInset = withLeading ? LIST_ROW_TEXT_INSET : LIST_ROW_PADDING_H;

  const renderCell = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: index === 0 ? theme.radius.card : 0,
          borderTopRightRadius: index === 0 ? theme.radius.card : 0,
          borderBottomLeftRadius: index === lastIndex ? theme.radius.card : 0,
          borderBottomRightRadius: index === lastIndex ? theme.radius.card : 0,
          paddingTop: index === 0 ? space[1] : 0,
          paddingBottom: index === lastIndex ? space[1] : 0,
        }}
      >
        {renderItem(item, index)}
      </View>
    ),
    [renderItem, lastIndex, theme],
  );

  const renderSeparator = useCallback(
    () => (
      <View style={{ backgroundColor: theme.colors.surface }}>
        <ListSeparator inset={separatorInset} />
      </View>
    ),
    [theme, separatorInset],
  );

  let placeholder: React.ReactElement | null = null;
  if (state.status === 'loading') {
    placeholder = (
      <SkeletonGroup accessibilityLabel={t('common.loading')} testID={testID ? `${testID}-loading` : undefined}>
        <ListGroup withLeading={withLeading}>
          {Array.from({ length: skeletonCount }, (_, index) => (
            <ListRowSkeleton key={index} withLeading={withLeading} />
          ))}
        </ListGroup>
      </SkeletonGroup>
    );
  } else if (state.status === 'error') {
    placeholder = <ErrorState {...error} />;
  } else if (state.items.length === 0) {
    placeholder = <EmptyState {...empty} />;
  }

  const loadingMore = state.status === 'ready' && state.loadingMore === true;

  return (
    <FlatList
      testID={testID}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderCell}
      ItemSeparatorComponent={renderSeparator}
      // Marge sous l'en-tête plutôt qu'un `gap` sur le conteneur, qui
      // séparerait aussi chaque ligne de la carte.
      ListHeaderComponent={header ? <View style={{ marginBottom: space[4] }}>{header}</View> : null}
      ListEmptyComponent={placeholder}
      ListFooterComponent={
        loadingMore ? (
          <View style={{ paddingVertical: space[4] }}>
            <ActivityIndicator accessibilityLabel={t('common.loading')} color={theme.colors.textSecondary} />
          </View>
        ) : null
      }
      onEndReached={state.status === 'ready' && !loadingMore ? onEndReached : undefined}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={state.status === 'ready' && state.refreshing === true}
            onRefresh={onRefresh}
            tintColor={theme.colors.textSecondary}
          />
        ) : undefined
      }
      style={{ backgroundColor: theme.colors.bg }}
      contentContainerStyle={{
        paddingHorizontal: layout.screenPaddingH,
        paddingVertical: space[4],
      }}
    />
  );
}
