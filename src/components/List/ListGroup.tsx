import React from 'react';
import { View } from 'react-native';

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeProvider';
import { border, shadow, space } from '../../theme/theme';
import { LIST_ROW_PADDING_H, LIST_ROW_TEXT_INSET } from './ListRow';

export type ListGroupProps = {
  /** En-tête de section, 13 px — déjà traduit. */
  title?: string;
  /** Les lignes ont-elles une vignette ? Détermine où commence le séparateur. */
  withLeading?: boolean;
  children: React.ReactNode;
  testID?: string;
};

/**
 * Format de liste par défaut : groupée en carte, rayon de carte, ombre douce,
 * séparateurs internes encastrés (UI-GUIDELINES.md §6). Ombres iOS et
 * Android fournies ensemble via `shadow.s1` (invariant n°19).
 */
export function ListGroup({ title, withLeading = false, children, testID }: ListGroupProps): React.JSX.Element {
  const { theme } = useTheme();
  const rows = React.Children.toArray(children).filter(React.isValidElement);
  const separatorInset = withLeading ? LIST_ROW_TEXT_INSET : LIST_ROW_PADDING_H;

  return (
    <Box gap={2} testID={testID}>
      {title ? (
        <Box paddingHorizontal={1}>
          <Text variant="label" color="textSecondary" accessibilityRole="header">
            {title}
          </Text>
        </Box>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.card,
          paddingVertical: space[1],
          ...shadow.s1,
        }}
      >
        {rows.map((row, index) => (
          <React.Fragment key={row.key ?? index}>
            {index > 0 ? <ListSeparator inset={separatorInset} /> : null}
            {row}
          </React.Fragment>
        ))}
      </View>
    </Box>
  );
}

/** Séparateur décoratif — `border` à 1,3:1 volontairement (UI-GUIDELINES.md §9). */
export function ListSeparator({ inset }: { inset: number }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      importantForAccessibility="no"
      style={{ height: border.hairline, marginLeft: inset, backgroundColor: theme.colors.border }}
    />
  );
}
