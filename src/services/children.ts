/**
 * Profils enfants du compte. Aucun backend n'est choisi
 * (DECISIONS-OUVERTES.md §2.1) : l'interface est stable, l'implémentation
 * est une démonstration en mémoire, à remplacer sans toucher aux écrans.
 */
export type ChildProfile = {
  id: string;
  firstName: string;
  /** Classe affichée, ex. « 6e ». Donnée, pas une clé de traduction. */
  grade: string;
};

export type ChildrenService = {
  listChildren: () => Promise<readonly ChildProfile[]>;
  getChild: (id: string) => Promise<ChildProfile | null>;
};

/** Données de démonstration — les mêmes enfants que les prototypes. */
const DEMO_CHILDREN: readonly ChildProfile[] = [
  { id: 'demo-lea', firstName: 'Léa', grade: '6e' },
  { id: 'demo-tom', firstName: 'Tom', grade: 'CM2' },
];

export const demoChildrenService: ChildrenService = {
  async listChildren() {
    return DEMO_CHILDREN;
  },
  async getChild(id) {
    return DEMO_CHILDREN.find((child) => child.id === id) ?? null;
  },
};

/** Point d'injection unique : le jour où un backend existe, seul ce choix change. */
export const childrenService: ChildrenService = demoChildrenService;
