import { border, borderInteractive, shadow, type Theme } from '../../theme/theme';

/**
 * Les six variantes de UI-GUIDELINES.md §4. `primaryWithAffordance` n'a de
 * sens que sur `Button` (un bouton avec libellé) : `IconButton` n'a pas de
 * variante affordance puisqu'il EST déjà l'affordance.
 */
export type ButtonVariant = 'primaryWithAffordance' | 'primary' | 'secondary' | 'tonal' | 'ghost' | 'destructive';
export type IconButtonVariant = Exclude<ButtonVariant, 'primaryWithAffordance'>;

type VariantColors = {
  background: string;
  content: string;
  borderColor?: string;
  borderWidth?: number;
};

export function resolveVariantColors(theme: Theme, variant: ButtonVariant): VariantColors {
  switch (variant) {
    case 'primaryWithAffordance':
    case 'primary':
      return { background: theme.colors.action, content: theme.colors.actionText };
    case 'secondary':
      return {
        background: theme.colors.surface,
        content: theme.colors.textPrimary,
        borderColor: borderInteractive,
        borderWidth: border.default,
      };
    case 'tonal':
      return { background: theme.colors.infoBg, content: theme.colors.info };
    case 'ghost':
      return { background: 'transparent', content: theme.colors.textSecondary };
    case 'destructive':
      return { background: theme.colors.error, content: theme.colors.actionText };
    default: {
      const exhaustive: never = variant;
      throw new Error(`Variante de bouton non gérée : ${String(exhaustive)}`);
    }
  }
}

export type ShadowStyle = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

/** Normal → ombre s2, pressé → ombre réduite s1, désactivé → aucune ombre. */
export function resolveShadow(pressed: boolean, disabled: boolean | undefined): ShadowStyle | undefined {
  if (disabled) return undefined;
  return pressed ? shadow.s1 : shadow.s2;
}
