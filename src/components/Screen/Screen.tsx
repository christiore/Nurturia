import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { layout, space } from '../../theme/theme';

export type ScreenProps = {
  children: React.ReactNode;
  /**
   * Défilement par défaut : à 200 % de taille de texte, aucun écran ne
   * tient sans défiler (invariant n°14). Désactivable pour un écran qui gère
   * lui-même son défilement (ex. une `AsyncList`).
   */
  scroll?: boolean;
  /** Contenu épinglé en bas, hors de la zone défilante (ex. le bouton principal). */
  footer?: React.ReactNode;
  testID?: string;
};

/** Cadre commun d'un écran : zones sûres, fond du thème, colonne centrée. */
export function Screen({ children, scroll = true, footer, testID }: ScreenProps): React.JSX.Element {
  const { theme } = useTheme();

  const column = (
    <View
      style={{
        width: '100%',
        maxWidth: layout.contentMaxWidth,
        alignSelf: 'center',
        gap: space[5],
        flexGrow: 1,
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom', 'left', 'right']} testID={testID}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: layout.screenPaddingH,
            paddingVertical: space[5],
          }}
          keyboardShouldPersistTaps="handled"
        >
          {column}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: layout.screenPaddingH, paddingVertical: space[5] }}>{column}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: layout.screenPaddingH,
            paddingBottom: space[4],
            paddingTop: space[2],
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            gap: space[3],
          }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
