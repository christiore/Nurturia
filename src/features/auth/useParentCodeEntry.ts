import { useCallback, useEffect, useState } from 'react';

import { devParentCodeStore, type ParentCodeStore } from './devParentCodeStore';
import { getLockoutState, recordFailedAttempt, recordSuccessfulUnlock, type LockoutState } from './lockout';
import { PARENT_CODE_LENGTH } from './parentCode';

export type ParentCodeEntryStatus = 'idle' | 'checking' | 'wrong' | 'unlocked';

export type ParentCodeEntry = {
  digits: string;
  status: ParentCodeEntryStatus;
  /** `null` tant que l'état persistant n'est pas lu : le clavier reste inerte. */
  lockout: LockoutState | null;
  isLocked: boolean;
  pressDigit: (digit: string) => void;
  deleteDigit: () => void;
};

const now = (): number => Date.now();

/**
 * Saisie du code parent pour sortir du mode enfant (PARCOURS.md §3).
 * Le sixième chiffre déclenche la vérification. Chaque échec est enregistré
 * dans le compteur persistant de `lockout.ts` : fermer l'app ne remet pas le
 * compteur à zéro (CLAUDE.md §6). Pendant une pause, le clavier est inerte et
 * le temps restant est relu chaque seconde depuis le stockage.
 */
export function useParentCodeEntry({
  onUnlocked,
  store = devParentCodeStore,
}: {
  onUnlocked: () => void;
  store?: ParentCodeStore;
}): ParentCodeEntry {
  const [digits, setDigits] = useState('');
  const [status, setStatus] = useState<ParentCodeEntryStatus>('idle');
  const [lockout, setLockout] = useState<LockoutState | null>(null);
  const isLocked = lockout === null || lockout.locked;

  // Lecture initiale de l'état persistant (une pause peut être en cours).
  useEffect(() => {
    let mounted = true;
    getLockoutState(now()).then((state) => {
      if (mounted) setLockout(state);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Décompte de la pause, relu depuis le stockage tant qu'elle dure.
  const pauseActive = lockout?.locked === true;
  useEffect(() => {
    if (!pauseActive) return undefined;
    const timer = setInterval(() => {
      getLockoutState(now()).then(setLockout);
    }, 1000);
    return () => clearInterval(timer);
  }, [pauseActive]);

  const verify = useCallback(
    async (code: string) => {
      setStatus('checking');
      if (await store.verifyParentCode(code)) {
        await recordSuccessfulUnlock(now());
        setStatus('unlocked');
        onUnlocked();
        return;
      }
      setLockout(await recordFailedAttempt(now()));
      setDigits('');
      setStatus('wrong');
    },
    [store, onUnlocked],
  );

  const pressDigit = useCallback(
    (digit: string) => {
      if (isLocked || status === 'checking' || status === 'unlocked') return;
      if (digits.length >= PARENT_CODE_LENGTH) return;
      const next = digits + digit;
      setDigits(next);
      if (next.length === PARENT_CODE_LENGTH) {
        void verify(next);
      } else if (status === 'wrong') {
        setStatus('idle');
      }
    },
    [digits, isLocked, status, verify],
  );

  const deleteDigit = useCallback(() => {
    if (isLocked || status === 'checking') return;
    setDigits((current) => current.slice(0, -1));
  }, [isLocked, status]);

  return { digits, status, lockout, isLocked, pressDigit, deleteDigit };
}
