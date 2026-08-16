import { isDeepLinkAllowed } from '../deepLinks';
import { PARENT_ROUTES } from '../routes';

describe("liens profonds désactivés en mode enfant, hors liste d'exceptions", () => {
  it('bloque tout lien profond en mode enfant par défaut', () => {
    expect(isDeepLinkAllowed('ChildHome', 'child')).toBe(false);
    expect(isDeepLinkAllowed('Subjects', 'child')).toBe(false);
  });

  it('autorise une route explicitement listée en exception', () => {
    expect(isDeepLinkAllowed('Progress', 'child', { allowedInChildMode: ['Progress'] })).toBe(true);
    expect(isDeepLinkAllowed('Subjects', 'child', { allowedInChildMode: ['Progress'] })).toBe(false);
  });

  it('autorise les routes parent en mode parent, comme la navigation normale', () => {
    for (const route of PARENT_ROUTES) {
      expect(isDeepLinkAllowed(route, 'parent')).toBe(true);
    }
  });
});
