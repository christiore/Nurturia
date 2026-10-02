import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Préférence système « réduire les animations » (CLAUDE.md, invariant de
 * code n°15). Tout composant animé la consulte ici plutôt que de dupliquer
 * l'abonnement à `AccessibilityInfo`.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
