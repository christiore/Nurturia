import { getSecureItem, setSecureItem, SecureStoreKey } from '../../services/secureStore';

/**
 * Anti-force brute persistant du verrou de mode enfant — PARCOURS.md §3,
 * CLAUDE.md §6. Deux propriétés qui ne se négocient pas :
 *
 * 1. Le délai survit à la fermeture de l'application : tout vit dans
 *    `secureStore`, jamais en mémoire (PROMPTSESSION1.md §6).
 * 2. Le blocage ne dépend jamais de l'horloge locale seule : chaque lecture
 *    ou écriture fait avancer un repère `lastKnownTime` qui ne recule
 *    jamais, et compare l'horloge courante à ce repère avant tout calcul —
 *    voir `syncClock` ci-dessous pour la limite connue de cette approche.
 */

export const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
export const BASE_LOCKOUT_SECONDS = 60;

export type LockoutState = {
  locked: boolean;
  remainingSeconds: number;
  /** "Encore N essais avant une pause" — PARCOURS.md §3 : ne jamais cacher cette information. */
  attemptsRemainingBeforeLockout: number;
};

/** 5 essais → 60 s, puis doublement (2 min, 4 min…) — PARCOURS.md §3. */
export function computeLockoutSeconds(attempts: number): number {
  if (attempts < MAX_ATTEMPTS_BEFORE_LOCKOUT) return 0;
  const doublings = attempts - MAX_ATTEMPTS_BEFORE_LOCKOUT;
  return BASE_LOCKOUT_SECONDS * 2 ** doublings;
}

function buildLockoutState(referenceTime: number, attempts: number, lockoutUntil: number): LockoutState {
  const locked = referenceTime < lockoutUntil;
  return {
    locked,
    remainingSeconds: locked ? Math.ceil((lockoutUntil - referenceTime) / 1000) : 0,
    attemptsRemainingBeforeLockout: Math.max(0, MAX_ATTEMPTS_BEFORE_LOCKOUT - attempts),
  };
}

async function readStoredState(): Promise<{ attempts: number; lockoutUntil: number; lastKnownTime: number }> {
  const [attemptsRaw, lockoutUntilRaw, lastKnownTimeRaw] = await Promise.all([
    getSecureItem(SecureStoreKey.failedAttempts),
    getSecureItem(SecureStoreKey.lockoutUntil),
    getSecureItem(SecureStoreKey.lastKnownTime),
  ]);
  return {
    attempts: attemptsRaw === null ? 0 : Number.parseInt(attemptsRaw, 10),
    lockoutUntil: lockoutUntilRaw === null ? 0 : Number.parseInt(lockoutUntilRaw, 10),
    lastKnownTime: lastKnownTimeRaw === null ? 0 : Number.parseInt(lastKnownTimeRaw, 10),
  };
}

async function persistState(state: { attempts: number; lockoutUntil: number; lastKnownTime: number }): Promise<void> {
  await Promise.all([
    setSecureItem(SecureStoreKey.failedAttempts, String(state.attempts)),
    setSecureItem(SecureStoreKey.lockoutUntil, String(state.lockoutUntil)),
    setSecureItem(SecureStoreKey.lastKnownTime, String(state.lastKnownTime)),
  ]);
}

type SyncedClock = { referenceTime: number; rollbackDetected: boolean; attempts: number; lockoutUntil: number };

/**
 * `referenceTime` ne recule jamais : c'est max(horloge courante, dernier
 * repère connu). Un recul de l'horloge (`now < lastKnownTime`) est traité
 * comme une tentative échouée supplémentaire (CLAUDE.md §6), et le nouveau
 * blocage est calculé sur `referenceTime` — jamais sur l'horloge trafiquée
 * — pour qu'un recul ne puisse jamais raccourcir un blocage en cours.
 *
 * LIMITE CONNUE (hors ligne, signalée comme demandé) : sans source de temps
 * de confiance (pas d'appel réseau NTP côté MVP), ce mécanisme ne détecte
 * qu'un recul *sous le plus haut repère déjà observé sur cet appareil*. Il
 * ne peut rien contre : une horloge fausse dès le tout premier lancement
 * (avant qu'un repère existe) ; un appareil dont le stockage sécurisé est
 * lui-même compromis (root/jailbreak) ; ou une avance d'horloge suivie d'un
 * retour à l'heure réelle qui reste au-dessus du dernier repère. Une
 * synchronisation d'horloge serveur, si un backend existe un jour
 * (DECISIONS-OUVERTES.md §2.1), fermerait ces trois cas.
 */
async function syncClock(now: number): Promise<SyncedClock> {
  const stored = await readStoredState();
  const rollbackDetected = now < stored.lastKnownTime;
  const referenceTime = Math.max(now, stored.lastKnownTime);

  let attempts = stored.attempts;
  let lockoutUntil = stored.lockoutUntil;

  if (rollbackDetected) {
    attempts += 1;
    const lockoutSeconds = computeLockoutSeconds(attempts);
    if (lockoutSeconds > 0) {
      lockoutUntil = Math.max(lockoutUntil, referenceTime + lockoutSeconds * 1000);
    }
  }

  await persistState({ attempts, lockoutUntil, lastKnownTime: referenceTime });
  return { referenceTime, rollbackDetected, attempts, lockoutUntil };
}

/** À appeler à l'ouverture de l'écran de code : vérifie l'horloge et lit l'état courant. */
export async function getLockoutState(now: number = Date.now()): Promise<LockoutState> {
  const synced = await syncClock(now);
  return buildLockoutState(synced.referenceTime, synced.attempts, synced.lockoutUntil);
}

/** À appeler après un code parent incorrect. */
export async function recordFailedAttempt(now: number = Date.now()): Promise<LockoutState> {
  const synced = await syncClock(now);
  const attempts = synced.attempts + 1;
  const lockoutSeconds = computeLockoutSeconds(attempts);
  const lockoutUntil = lockoutSeconds > 0 ? synced.referenceTime + lockoutSeconds * 1000 : synced.lockoutUntil;
  await persistState({ attempts, lockoutUntil, lastKnownTime: synced.referenceTime });
  return buildLockoutState(synced.referenceTime, attempts, lockoutUntil);
}

/** À appeler après un code parent correct : remet le compteur à zéro. */
export async function recordSuccessfulUnlock(now: number = Date.now()): Promise<void> {
  const synced = await syncClock(now);
  await persistState({ attempts: 0, lockoutUntil: 0, lastKnownTime: synced.referenceTime });
}
