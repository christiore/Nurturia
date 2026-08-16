import {
  BASE_LOCKOUT_SECONDS,
  computeLockoutSeconds,
  getLockoutState,
  MAX_ATTEMPTS_BEFORE_LOCKOUT,
  recordFailedAttempt,
  recordSuccessfulUnlock,
} from '../lockout';

jest.mock('../../../services/secureStore');

// jest.requireMock (pas un import direct de __mocks__/secureStore) : un
// import direct créerait une DEUXIÈME instance du module, distincte de
// celle que lockout.ts obtient via le chemin mocké — deux `store` en
// mémoire différents, donc un reset qui ne réinitialiserait rien pour
// lockout.ts. requireMock renvoie l'instance déjà mise en cache pour ce
// chemin, la même que celle utilisée par lockout.ts.
const { __resetSecureStore } =
  jest.requireMock<typeof import('../../../services/__mocks__/secureStore')>('../../../services/secureStore');

const T0 = 1_700_000_000_000; // repère arbitraire, en millisecondes

beforeEach(() => {
  __resetSecureStore();
});

describe('computeLockoutSeconds', () => {
  it("ne bloque pas avant le 5e échec", () => {
    for (let attempts = 0; attempts < MAX_ATTEMPTS_BEFORE_LOCKOUT; attempts += 1) {
      expect(computeLockoutSeconds(attempts)).toBe(0);
    }
  });

  it('bloque 60 s au 5e échec, puis double à chaque échec suivant', () => {
    expect(computeLockoutSeconds(5)).toBe(BASE_LOCKOUT_SECONDS);
    expect(computeLockoutSeconds(6)).toBe(BASE_LOCKOUT_SECONDS * 2);
    expect(computeLockoutSeconds(7)).toBe(BASE_LOCKOUT_SECONDS * 4);
  });
});

describe('persistance du compteur d\'échecs', () => {
  it('un blocage déclenché par recordFailedAttempt est relu par un nouvel appel à getLockoutState', async () => {
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) {
      await recordFailedAttempt(T0);
    }
    // "Tuer l'application" == relire l'état depuis le stockage, pas depuis
    // une variable en mémoire : getLockoutState() ne fait que ça.
    const state = await getLockoutState(T0);
    expect(state.locked).toBe(true);
    expect(state.remainingSeconds).toBe(BASE_LOCKOUT_SECONDS);
  });

  it('le blocage se lève une fois le délai écoulé', async () => {
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) {
      await recordFailedAttempt(T0);
    }
    const stillLocked = await getLockoutState(T0 + (BASE_LOCKOUT_SECONDS - 1) * 1000);
    expect(stillLocked.locked).toBe(true);

    const unlocked = await getLockoutState(T0 + (BASE_LOCKOUT_SECONDS + 1) * 1000);
    expect(unlocked.locked).toBe(false);
  });

  it('recordSuccessfulUnlock remet le compteur à zéro', async () => {
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) {
      await recordFailedAttempt(T0);
    }
    await recordSuccessfulUnlock(T0);
    const state = await getLockoutState(T0);
    expect(state.locked).toBe(false);
    expect(state.attemptsRemainingBeforeLockout).toBe(MAX_ATTEMPTS_BEFORE_LOCKOUT);
  });

  it("affiche les essais restants avant blocage, jamais caché", async () => {
    await recordFailedAttempt(T0);
    await recordFailedAttempt(T0);
    const state = await getLockoutState(T0);
    expect(state.attemptsRemainingBeforeLockout).toBe(MAX_ATTEMPTS_BEFORE_LOCKOUT - 2);
  });
});

describe('recul de l\'horloge', () => {
  it('un recul après un blocage est traité comme une tentative échouée et ne raccourcit jamais le blocage', async () => {
    for (let i = 0; i < MAX_ATTEMPTS_BEFORE_LOCKOUT; i += 1) {
      await recordFailedAttempt(T0);
    }
    const honestState = await getLockoutState(T0);
    expect(honestState.remainingSeconds).toBe(BASE_LOCKOUT_SECONDS);

    // L'enfant recule l'horloge de 10 minutes pour essayer de repartir à zéro.
    const rolledBack = await getLockoutState(T0 - 10 * 60 * 1000);

    // Le blocage doit être au moins aussi long qu'avant le recul, jamais raccourci.
    expect(rolledBack.locked).toBe(true);
    expect(rolledBack.remainingSeconds).toBeGreaterThanOrEqual(BASE_LOCKOUT_SECONDS);
  });

  it('un recul avant le seuil de blocage compte comme un échec de plus', async () => {
    await recordFailedAttempt(T0);
    await getLockoutState(T0 - 1000); // recul d'une seconde : détecté, compte pour un échec
    const state = await getLockoutState(T0);
    expect(state.attemptsRemainingBeforeLockout).toBe(MAX_ATTEMPTS_BEFORE_LOCKOUT - 2);
  });
});
