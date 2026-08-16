import type { AppMode } from './modeState';
import { isRouteAllowed, type RouteName } from './routes';

/**
 * « Les liens profonds sont désactivés en mode enfant, hors liste explicite
 * d'exceptions. » (PROMPTSESSION1.md §6)
 *
 * Le parsing d'une URL réelle (`nurtura://...`) vers un `RouteName` dépend
 * du navigateur qui n'est pas encore choisi (aucun écran produit dans cette
 * session — voir routes.ts) ; cette policy prend volontairement une route
 * déjà résolue en entrée, pas une URL brute, pour rester indépendante de ce
 * choix futur.
 */
export type DeepLinkPolicy = {
  /** Routes explicitement autorisées par lien profond même en mode enfant. */
  allowedInChildMode: readonly RouteName[];
};

export const DEFAULT_DEEP_LINK_POLICY: DeepLinkPolicy = { allowedInChildMode: [] };

export function isDeepLinkAllowed(
  route: RouteName,
  mode: AppMode,
  policy: DeepLinkPolicy = DEFAULT_DEEP_LINK_POLICY,
): boolean {
  if (mode === 'parent') {
    return isRouteAllowed(route, mode);
  }
  return policy.allowedInChildMode.includes(route);
}
