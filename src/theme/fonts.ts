import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import type { TextStyle } from 'react-native';

import { typography } from './theme';

/**
 * Polices chargées par famille ET par graisse. Sur Android, une police
 * personnalisée ne se met pas en gras avec `fontWeight` : chaque graisse est
 * un fichier, donc un nom de famille distinct. Les composants ne combinent
 * jamais `fontFamily` et `fontWeight` à la main : ils passent par `fontStyle()`.
 *
 * Si la palette du 2 octobre est validée (DECISIONS-OUVERTES.md §7.1), le
 * changement de police se fait ici et dans `typography.family`, nulle part ailleurs.
 */
type LoadedFamily = typeof typography.family.display | typeof typography.family.text;
type Weight = '400' | '500' | '600' | '700' | '800';

function registeredName(family: LoadedFamily, weight: Weight): string {
  return `${family}_${weight}`;
}

/** À passer à `useFonts` au démarrage de l'application. */
export const FONT_FILES = {
  [registeredName('Inter', '400')]: Inter_400Regular,
  [registeredName('Inter', '500')]: Inter_500Medium,
  [registeredName('Inter', '600')]: Inter_600SemiBold,
  [registeredName('Inter', '700')]: Inter_700Bold,
  [registeredName('Inter', '800')]: Inter_800ExtraBold,
  [registeredName('Nunito', '400')]: Nunito_400Regular,
  [registeredName('Nunito', '500')]: Nunito_500Medium,
  [registeredName('Nunito', '600')]: Nunito_600SemiBold,
  [registeredName('Nunito', '700')]: Nunito_700Bold,
  [registeredName('Nunito', '800')]: Nunito_800ExtraBold,
} as const;

function isWeight(value: string): value is Weight {
  return value === '400' || value === '500' || value === '600' || value === '700' || value === '800';
}

/**
 * Le style de police à appliquer : la famille déjà chargée pour cette graisse.
 * `fontWeight` est volontairement omis — c'est le fichier qui porte la graisse.
 */
export function fontStyle(family: LoadedFamily, weight: TextStyle['fontWeight']): Pick<TextStyle, 'fontFamily'> {
  const normalized = String(weight ?? '400');
  return { fontFamily: registeredName(family, isWeight(normalized) ? normalized : '400') };
}
