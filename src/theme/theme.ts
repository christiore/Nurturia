/**
 * Nurtura — Design tokens pour React Native / Expo
 * Version 0.1.0-draft — 13 août 2026
 *
 * Source de vérité : tokens.json. Ce fichier en est la transposition typée.
 * Règle : aucune valeur brute (#hex, nombre de padding) dans les composants.
 * Tout passe par `useTheme()`.
 */

// ─────────────────────────────────────────────────────────────
// 1. Primitives — la palette. On n'utilise JAMAIS ces valeurs
//    directement dans un écran : on passe par les rôles (§3).
// ─────────────────────────────────────────────────────────────

export const palette = {
  neutral: {
    0: '#FFFFFF',
    50: '#F6F7FB',
    100: '#EDEFF4',
    200: '#DEE2EA',
    300: '#C2C7D4',
    400: '#9AA1B2',
    500: '#767D90',
    550: '#686F82',
    600: '#565C6E',
    700: '#3A3F4E',
    800: '#262A36',
    900: '#171A23',
    950: '#0F1117',
  },
  primary: {
    50: '#F4F3FE',
    100: '#E9E7FD',
    300: '#B7B1F5',
    500: '#7A71E9',
    600: '#5A4FE0',
    700: '#3D33B8',
    800: '#2F2790',
    900: '#241C6B',
  },
  accent: { 100: '#FFEADF', 300: '#FFC0A0', 500: '#FF8A4C', 600: '#E0631F', 700: '#A63F10' },
  sage: { 100: '#DFF3ED', 500: '#2FA98C', 600: '#26856D', 700: '#1E6B58' },
  amber: { 100: '#FDF0CE', 500: '#F2B807', 700: '#8A5A00' },
  danger: { 100: '#FBE7E7', 600: '#C93838', 700: '#A32A2A' },
  sand: { 50: '#FFF8F2', 100: '#FFF1E6', 200: '#F7E4D4' },
} as const;

/**
 * Bordure des contrôles dont la limite EST l'affordance : bouton secondaire,
 * bouton icône contour, champ posé sur une surface blanche.
 * WCAG 1.4.11 exige ≥ 3:1 — `palette.neutral[300]` n'atteint que 1,69:1.
 * Les séparateurs de liste, décoratifs, restent en `palette.neutral[200]`.
 */
export const borderInteractive = '#848BA0';

/** Échelle d'intensité pour la data viz parent. Toujours doublée d'une valeur texte. */
export const dataviz = {
  empty: '#EDEFF4',
  l1: '#CFCBF8',
  l2: '#8C84EE',
  l3: '#5A4FE0',
} as const;

/** Couleurs par matière. `ink` = texte sur `tint`. `solid` = aplat décoratif. */
export const subject = {
  maths: { ink: '#3D33B8', tint: '#E9E7FD', solid: '#5A4FE0' },
  francais: { ink: '#A63F10', tint: '#FFEADF', solid: '#E0631F' },
  sciences: { ink: '#1E6B58', tint: '#DFF3ED', solid: '#26856D' },
  histoire: { ink: '#A63A6E', tint: '#FBE6F0', solid: '#C64B85' },
  anglais: { ink: '#1F6BA8', tint: '#E2F0FB', solid: '#2C7FC4' },
  arts: { ink: '#8A5A00', tint: '#FDF0CE', solid: '#B37800' },
} as const;

export type SubjectKey = keyof typeof subject;

// ─────────────────────────────────────────────────────────────
// 2. Fondations partagées par les deux apps
// ─────────────────────────────────────────────────────────────

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64 } as const;

export const radius = { xs: 8, sm: 12, md: 16, lg: 20, xl: 28, xxl: 32, pill: 999 } as const;

export const border = { hairline: 1, default: 1.5, focus: 2, emphasis: 3 } as const;

/**
 * Cible tactile minimale : 48. Si le visuel est plus petit (ex. icône 24),
 * étendre la zone avec hitSlop — ne jamais agrandir le visuel pour compenser.
 */
export const touch = { min: 48, recommended: 56, minGap: 8 } as const;

export const layout = {
  screenPaddingH: 20,
  sectionGap: 28,
  cardGap: 12,
  listRowMinHeight: 64,
  listRowTwoLineHeight: 76,
  tabBarHeight: 64,
  headerHeightCompact: 56,
  sheetTopRadius: 28,
  /**
   * Largeur maximale de colonne de contenu, ajoutée à la session 1 (fondations)
   * pour la cible tablette — absente du theme.ts fourni à l'origine.
   *
   * Valeur retenue : 720. Justification : la règle de lecture de
   * UI-GUIDELINES.md §3.2 fixe une longueur de ligne ≤ 60 caractères ; à
   * `bodyL` (17px) sur Inter, 60 caractères tiennent dans ~560-600px de texte.
   * 720 laisse une marge pour les cartes et grilles à deux colonnes (icône +
   * texte, StatTile côte à côte) sans jamais étirer une ligne de texte brute
   * sur toute la largeur d'un iPad 1024pt en mode `expanded`. C'est une
   * hypothèse de dimensionnement, pas une valeur vérifiée en usage — à
   * confronter aux premiers écrans tablette réels.
   */
  contentMaxWidth: 720,
} as const;

export const typography = {
  family: {
    display: 'Nunito',
    text: 'Inter',
    /** Option d'accessibilité activable par l'utilisateur. */
    dyslexia: 'AtkinsonHyperlegible',
  },
  displayXl: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.6 },
  displayL: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.4 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: '600', letterSpacing: 0 },
  bodyL: { fontSize: 17, lineHeight: 26, fontWeight: '400', letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400', letterSpacing: 0 },
  bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '600', letterSpacing: 0 },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '400', letterSpacing: 0 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.1 },
  micro: { fontSize: 11, lineHeight: 15, fontWeight: '600', letterSpacing: 0.3 },
  numberXl: { fontSize: 40, lineHeight: 44, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  numberL: { fontSize: 28, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
} as const;

/** Ombres : iOS via shadow*, Android via elevation. Toujours fournir les deux. */
export const shadow = {
  s1: {
    shadowColor: '#171A23',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  s2: {
    shadowColor: '#171A23',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  s3: {
    shadowColor: '#171A23',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

export const motion = {
  duration: { micro: 120, fast: 180, standard: 240, enter: 320, screen: 400 },
  /** Valeurs à passer à `Easing.bezier(...)` de react-native-reanimated. */
  easing: {
    standard: [0.2, 0.8, 0.2, 1],
    emphasized: [0.2, 0, 0, 1],
    exit: [0.4, 0, 1, 1],
  },
  press: { scale: 0.97, duration: 120 },
} as const;

// ─────────────────────────────────────────────────────────────
// 3. Rôles sémantiques — ce que les composants consomment
// ─────────────────────────────────────────────────────────────

const semanticShared = {
  /** ROUGE = erreur système ou de saisie UNIQUEMENT. Jamais la performance de l'enfant. */
  error: palette.danger[600],
  errorBg: palette.danger[100],
  warning: palette.amber[700],
  warningBg: palette.amber[100],
  progress: palette.sage[600],
  progressBg: palette.sage[100],
  info: palette.primary[700],
  infoBg: palette.primary[100],
} as const;

export const childTheme = {
  name: 'child' as const,
  colors: {
    bg: palette.sand[50],
    bgAlt: palette.sand[100],
    surface: palette.neutral[0],
    surfaceSunken: palette.sand[100],
    surfaceInverse: palette.neutral[900],
    border: palette.sand[200],
    borderStrong: palette.neutral[300],
    textPrimary: palette.neutral[900],
    textSecondary: palette.neutral[600],
    textMuted: palette.neutral[550],
    textOnInverse: palette.neutral[0],
    /** Bouton primaire enfant = encre sombre (contraste maximal, lisible sur fond sable). */
    action: palette.neutral[900],
    actionText: palette.neutral[0],
    accent: palette.primary[600],
    focusRing: palette.primary[600],
    ...semanticShared,
  },
  radius: { card: radius.xl, control: radius.pill, field: radius.md },
  controlHeight: 56,
  displayFamily: typography.family.display,
} as const;

export const parentTheme = {
  name: 'parent' as const,
  colors: {
    bg: palette.neutral[50],
    bgAlt: palette.neutral[100],
    surface: palette.neutral[0],
    surfaceSunken: palette.neutral[100],
    surfaceInverse: palette.neutral[900],
    border: palette.neutral[200],
    borderStrong: palette.neutral[300],
    textPrimary: palette.neutral[900],
    textSecondary: palette.neutral[600],
    textMuted: palette.neutral[550],
    textOnInverse: palette.neutral[0],
    /** Bouton primaire parent = indigo de marque. */
    action: palette.primary[600],
    actionText: palette.neutral[0],
    accent: palette.primary[600],
    focusRing: palette.primary[600],
    ...semanticShared,
  },
  radius: { card: radius.lg, control: radius.pill, field: radius.md },
  controlHeight: 52,
  displayFamily: typography.family.text,
} as const;

export type Theme = typeof childTheme | typeof parentTheme;

export const themes = { child: childTheme, parent: parentTheme } as const;

// ─────────────────────────────────────────────────────────────
// 4. Tailles de composants — figées, pas d'improvisation en écran
// ─────────────────────────────────────────────────────────────

export const componentSize = {
  button: {
    lg: { height: 56, paddingH: 24, gap: 8, fontSize: 17 },
    md: { height: 48, paddingH: 20, gap: 8, fontSize: 15 },
    sm: { height: 40, paddingH: 16, gap: 6, fontSize: 15 },
  },
  /** Bouton rond icône seule — la signature visuelle « flèche » des refs. */
  iconButton: { lg: 56, md: 48, sm: 40 },
  field: { height: 56, paddingH: 16, radius: radius.md, borderWidth: border.default },
  textarea: { minHeight: 120, paddingV: 14 },
  chip: { height: 40, paddingH: 14, radius: radius.pill, hitSlopY: 4 },
  segmented: { height: 48, padding: 4, itemHeight: 40, radius: radius.pill },
  listLeading: { size: 44, radius: 14 },
  avatar: { sm: 32, md: 44, lg: 56 },
  tabBarItem: { size: 48 },
  switchTrack: { width: 52, height: 32 },
  sliderThumb: 28,
  progressBarHeight: 10,
} as const;

// ─────────────────────────────────────────────────────────────
// 5. Garde-fous produit encodés dans le système
// ─────────────────────────────────────────────────────────────

/**
 * Le positionnement Nurtura interdit les mécaniques de compétition et de
 * culpabilisation (cf. teardown concurrentiel du 2 août 2026). Ces jetons
 * n'existent pas volontairement — s'ils apparaissent dans une PR, c'est un bug produit.
 */
export const FORBIDDEN_PATTERNS = [
  'streak',
  'leaderboard',
  'classement',
  'league',
  'xp',
  'daily-goal-guilt',
  'loss-aversion-notification',
  'countdown-timer-rouge',
  'social-comparison',
] as const;

// ─────────────────────────────────────────────────────────────
// 6. Tablette — ajouté à la session 1 (fondations), 16 août 2026
//    Seul ajout demandé pour cibler téléphone + tablette. Rien d'autre
//    n'a été ajouté au thème sans validation.
// ─────────────────────────────────────────────────────────────

/**
 * Points de rupture en largeur de fenêtre logique (dp), pas en taille
 * physique d'appareil — une fenêtre partagée en iPadOS peut être `compact`.
 */
export const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 840,
} as const;

export type BreakpointName = keyof typeof breakpoints;
