import { useEffect, useState } from 'react';

import { useModeState } from '../../navigation/ModeProvider';
import { childrenService, type ChildProfile, type ChildrenService } from '../../services/children';
import { t } from '../../i18n';

export type ActiveChild =
  | { status: 'loading' }
  | { status: 'ready'; child: ChildProfile | null; firstName: string };

/**
 * Profil de l'enfant actif en mode enfant. Un profil introuvable ne doit pas
 * bloquer l'écran — l'enfant reste en mode enfant, verrou compris — d'où un
 * prénom de repli neutre plutôt qu'une erreur.
 */
export function useActiveChild(service: ChildrenService = childrenService): ActiveChild {
  const { activeChildId } = useModeState();
  const [state, setState] = useState<ActiveChild>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    const lookup = activeChildId ? service.getChild(activeChildId) : Promise.resolve(null);
    lookup
      .catch(() => null)
      .then((child) => {
        if (mounted) setState({ status: 'ready', child, firstName: child?.firstName ?? t('childHome.fallbackName') });
      });
    return () => {
      mounted = false;
    };
  }, [activeChildId, service]);

  return state;
}
