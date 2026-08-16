import { hashParentCode, isBlacklistedParentCode } from '../parentCode';

describe('isBlacklistedParentCode', () => {
  it('rejette la répétition d\'un seul chiffre', () => {
    expect(isBlacklistedParentCode('111111')).toBe(true);
    expect(isBlacklistedParentCode('999999')).toBe(true);
  });

  it('rejette les suites croissantes et décroissantes', () => {
    expect(isBlacklistedParentCode('123456')).toBe(true);
    expect(isBlacklistedParentCode('654321')).toBe(true);
  });

  it('rejette les blocs répétés (121212, 123123)', () => {
    expect(isBlacklistedParentCode('121212')).toBe(true);
    expect(isBlacklistedParentCode('123123')).toBe(true);
  });

  it("rejette les encodages plausibles d'une date de naissance", () => {
    const childBirthDate = { day: 14, month: 3, year: 2015 };
    // DDMMYY
    expect(isBlacklistedParentCode('140315', { childBirthDate })).toBe(true);
    // YYMMDD
    expect(isBlacklistedParentCode('150314', { childBirthDate })).toBe(true);
  });

  it('rejette aussi la date de naissance du parent', () => {
    const parentBirthDate = { day: 2, month: 11, year: 1985 };
    expect(isBlacklistedParentCode('021185', { parentBirthDate })).toBe(true);
  });

  it("n'inquiète pas un code qui n'a aucun de ces motifs", () => {
    expect(isBlacklistedParentCode('582047')).toBe(false);
  });

  it('exige exactement 6 chiffres', () => {
    expect(() => isBlacklistedParentCode('12345')).toThrow();
    expect(() => isBlacklistedParentCode('abcdef')).toThrow();
  });
});

describe('hashParentCode', () => {
  it("n'est pas implémenté tant que la bibliothèque de dérivation n'est pas validée", async () => {
    await expect(hashParentCode('582047', 'sel')).rejects.toThrow(/en attente de validation/);
  });
});
