import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Aucune clé, aucun secret, aucun jeton en dur ici ni dans le bundle client.
 * Toute valeur de configuration vient de `process.env`, chargée depuis `.env`
 * (non versionné — voir `.env.example`). `.env` reste local à la machine ou
 * au provider CI ; rien de sensible ne doit finir dans `extra`, qui est lisible
 * depuis le bundle client une fois l'app buildée.
 *
 * Aucun backend n'est choisi à ce stade (voir DECISIONS-OUVERTES.md §2.1) :
 * il n'y a donc aucune URL d'API ni clé cliente à lire pour l'instant.
 */
const appEnv = process.env.APP_ENV ?? 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Nurturia',
  slug: 'nurturia',
  /** Schéma des liens profonds (Expo Router). En mode enfant, ils sont refusés hors liste explicite (src/navigation/deepLinks.ts). */
  scheme: 'nurturia',
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-router', 'expo-font'],
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    appEnv,
  },
});
