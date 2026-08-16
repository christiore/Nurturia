/**
 * Code parent à 6 chiffres — CLAUDE.md §6, PARCOURS.md §3.
 *
 * Deux responsabilités volontairement séparées :
 * 1. La liste noire à la création (ci-dessous) est entièrement spécifiée —
 *    implémentée.
 * 2. La dérivation de clé (hash du code) N'EST PAS implémentée : voir
 *    `hashParentCode` en bas de fichier — proposition en attente de
 *    validation, comme demandé dans PROMPTSESSION1.md §6.
 */

export const PARENT_CODE_LENGTH = 6;

export type BirthDate = { day: number; month: number; year: number };

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Encodages plausibles à 6 chiffres d'une date de naissance : ce sont les
 * tout premiers codes qu'un enfant essaie (CLAUDE.md §6).
 */
function birthDateEncodings(date: BirthDate): string[] {
  const dd = pad2(date.day);
  const mm = pad2(date.month);
  const yy = pad2(date.year % 100);
  return [
    `${dd}${mm}${yy}`, // DDMMYY
    `${mm}${dd}${yy}`, // MMDDYY
    `${yy}${mm}${dd}`, // YYMMDD
    `${yy}${dd}${mm}`, // YYDDMM
  ];
}

function isAscendingOrDescendingRun(digits: number[]): boolean {
  const ascending = digits.every((digit, index) => index === 0 || digit === digits[index - 1]! + 1);
  const descending = digits.every((digit, index) => index === 0 || digit === digits[index - 1]! - 1);
  return ascending || descending;
}

function isSingleRepeatedDigit(digits: number[]): boolean {
  return digits.every((digit) => digit === digits[0]);
}

/**
 * Motifs répétés de type "121212" ou "123123" : évidents, mais pas des
 * suites ni une répétition d'un seul chiffre, donc pas couverts ci-dessus.
 */
function isRepeatingBlock(code: string): boolean {
  for (const blockSize of [1, 2, 3]) {
    if (PARENT_CODE_LENGTH % blockSize !== 0) continue;
    const block = code.slice(0, blockSize);
    const repeated = block.repeat(PARENT_CODE_LENGTH / blockSize);
    if (repeated === code) return true;
  }
  return false;
}

export type ParentCodeContext = {
  childBirthDate?: BirthDate;
  parentBirthDate?: BirthDate;
};

/**
 * true si `code` doit être refusé à la création. Ne dit jamais pourquoi
 * précisément (ne pas indiquer "c'est ta date de naissance" à l'écran)
 * — juste qu'il faut en choisir un autre.
 */
export function isBlacklistedParentCode(code: string, context: ParentCodeContext = {}): boolean {
  if (!/^\d{6}$/.test(code)) {
    throw new Error(`isBlacklistedParentCode attend une chaîne de ${PARENT_CODE_LENGTH} chiffres`);
  }
  const digits = code.split('').map(Number);

  if (isSingleRepeatedDigit(digits)) return true;
  if (isAscendingOrDescendingRun(digits)) return true;
  if (isRepeatingBlock(code)) return true;

  const birthDates = [context.childBirthDate, context.parentBirthDate].filter(
    (value): value is BirthDate => value !== undefined,
  );
  for (const birthDate of birthDates) {
    if (birthDateEncodings(birthDate).includes(code)) return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
// Dérivation de clé — PROPOSITION, PAS IMPLÉMENTÉE
// ─────────────────────────────────────────────────────────────

/**
 * Le code parent n'est jamais stocké en clair (PROMPTSESSION1.md §6). Il
 * faut une dérivation lente (KDF), pas un simple SHA-256 : un PIN à 6
 * chiffres n'a que 10⁶ combinaisons, cassable hors ligne en quelques
 * secondes avec un hash rapide si la valeur stockée fuitait un jour.
 *
 * Proposition, en attente de validation avant implémentation :
 *
 * - Bibliothèque : `@noble/hashes` (pure JS, zéro dépendance native,
 *   compatible Expo sans éjection/dev client). Fournit PBKDF2-SHA256.
 *   Alternative écartée : un module natif type `react-native-argon2`
 *   donnerait Argon2id (plus robuste) mais casse la compatibilité "Expo
 *   Go sans éjection" — nécessiterait un dev client / prebuild.
 * - Algorithme : PBKDF2-HMAC-SHA256.
 * - Itérations : 600 000 (recommandation OWASP 2023 pour PBKDF2-SHA256).
 * - Sel : 16 octets aléatoires (`expo-crypto` `getRandomBytesAsync`),
 *   généré à la création du code, stocké à côté du hash
 *   (`SecureStoreKey.parentCodeSalt`), jamais réutilisé.
 *
 * N'IMPLÉMENTE PAS la dérivation avant accord explicite — c'est la
 * consigne de PROMPTSESSION1.md §6, pas une prudence de ma part.
 */
// `async` pour rejeter la promesse (voir le test associé), pas la résoudre.
export async function hashParentCode(_code: string, _salt: string): Promise<string> {
  throw new Error(
    'hashParentCode: dérivation non implémentée — en attente de validation de la bibliothèque et du nombre ' +
      "d'itérations proposés dans le commentaire de src/features/auth/parentCode.ts.",
  );
}
