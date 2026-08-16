import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { space } from '../../theme/theme';

/**
 * Une clé de `space` (theme.ts §2), jamais un nombre de pixels libre.
 * Pas de prop `style` sur `Box` : c'est ce qui rend une valeur brute
 * impossible à passer, pas seulement déconseillée.
 */
export type SpaceToken = keyof typeof space;

export type BoxProps = {
  children?: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  gap?: SpaceToken;
  rowGap?: SpaceToken;
  columnGap?: SpaceToken;
  padding?: SpaceToken;
  paddingHorizontal?: SpaceToken;
  paddingVertical?: SpaceToken;
  paddingTop?: SpaceToken;
  paddingBottom?: SpaceToken;
  paddingLeft?: SpaceToken;
  paddingRight?: SpaceToken;
  margin?: SpaceToken;
  marginHorizontal?: SpaceToken;
  marginVertical?: SpaceToken;
  marginTop?: SpaceToken;
  marginBottom?: SpaceToken;
  marginLeft?: SpaceToken;
  marginRight?: SpaceToken;
  testID?: string;
};

export function Box({
  children,
  direction,
  align,
  justify,
  wrap,
  flex,
  gap,
  rowGap,
  columnGap,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  testID,
}: BoxProps): React.JSX.Element {
  const style: ViewStyle = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : undefined,
    flex,
    gap: gap === undefined ? undefined : space[gap],
    rowGap: rowGap === undefined ? undefined : space[rowGap],
    columnGap: columnGap === undefined ? undefined : space[columnGap],
    padding: padding === undefined ? undefined : space[padding],
    paddingHorizontal: paddingHorizontal === undefined ? undefined : space[paddingHorizontal],
    paddingVertical: paddingVertical === undefined ? undefined : space[paddingVertical],
    paddingTop: paddingTop === undefined ? undefined : space[paddingTop],
    paddingBottom: paddingBottom === undefined ? undefined : space[paddingBottom],
    paddingLeft: paddingLeft === undefined ? undefined : space[paddingLeft],
    paddingRight: paddingRight === undefined ? undefined : space[paddingRight],
    margin: margin === undefined ? undefined : space[margin],
    marginHorizontal: marginHorizontal === undefined ? undefined : space[marginHorizontal],
    marginVertical: marginVertical === undefined ? undefined : space[marginVertical],
    marginTop: marginTop === undefined ? undefined : space[marginTop],
    marginBottom: marginBottom === undefined ? undefined : space[marginBottom],
    marginLeft: marginLeft === undefined ? undefined : space[marginLeft],
    marginRight: marginRight === undefined ? undefined : space[marginRight],
  };

  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
}
