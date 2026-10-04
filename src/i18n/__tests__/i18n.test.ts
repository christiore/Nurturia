import { t } from '../index';

describe('t', () => {
  it('remplace chaque paramètre {nom}', () => {
    expect(t('pinPad.progress', { count: 2, total: 6 })).toBe('2 chiffres saisis sur 6');
  });

  it('échoue bruyamment quand un paramètre manque, plutôt que d’afficher « {name} »', () => {
    expect(() => t('childHome.greeting')).toThrow();
  });
});
