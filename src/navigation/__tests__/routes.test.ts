import { CHILD_ROUTES, getAvailableRoutes, isRouteAllowed, PARENT_ROUTES } from '../routes';

describe('garde du routeur — aucune route parent atteignable en mode enfant', () => {
  it("l'arbre de navigation du mode enfant ne contient aucune route parent", () => {
    const childTreeRoutes = getAvailableRoutes('child');
    for (const parentRoute of PARENT_ROUTES) {
      expect(childTreeRoutes).not.toContain(parentRoute);
    }
  });

  it('isRouteAllowed refuse chaque route parent en mode enfant', () => {
    for (const parentRoute of PARENT_ROUTES) {
      expect(isRouteAllowed(parentRoute, 'child')).toBe(false);
    }
  });

  it('isRouteAllowed autorise chaque route parent en mode parent', () => {
    for (const parentRoute of PARENT_ROUTES) {
      expect(isRouteAllowed(parentRoute, 'parent')).toBe(true);
    }
  });

  it('symétriquement, aucune route enfant dans l\'arbre du mode parent', () => {
    const parentTreeRoutes = getAvailableRoutes('parent');
    for (const childRoute of CHILD_ROUTES) {
      expect(parentTreeRoutes).not.toContain(childRoute);
    }
  });
});
