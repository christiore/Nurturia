import type { AppMode } from './modeState';

/**
 * Contrat de garde du routeur — PROMPTSESSION1.md §6 : « Le garde d'accès
 * est au niveau du routeur, jamais dans un écran. Les routes parent ne
 * doivent pas exister dans l'arbre de navigation quand le mode enfant est
 * actif. » Aucune bibliothèque de navigation n'est encore choisie (aucun
 * écran produit dans cette session) : ces identifiants sont le CONTRAT que
 * le futur navigateur réel devra respecter, pas une liste d'écrans
 * existants. Le futur arbre de navigation doit être généré depuis
 * `getAvailableRoutes(mode)` — jamais une liste d'écrans dupliquée à la
 * main quelque part d'autre, qui pourrait diverger de ce garde.
 */
export const PARENT_ROUTES = ['Today', 'Analytics', 'Settings', 'Account'] as const;
export const CHILD_ROUTES = ['ChildHome', 'Subjects', 'Progress', 'Profile'] as const;

export type ParentRouteName = (typeof PARENT_ROUTES)[number];
export type ChildRouteName = (typeof CHILD_ROUTES)[number];
export type RouteName = ParentRouteName | ChildRouteName;

export function getAvailableRoutes(mode: AppMode): readonly RouteName[] {
  return mode === 'parent' ? PARENT_ROUTES : CHILD_ROUTES;
}

export function isRouteAllowed(route: RouteName, mode: AppMode): boolean {
  return getAvailableRoutes(mode).includes(route);
}
