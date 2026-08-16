import fr from './fr.json';

/**
 * `fr` est la seule langue au lancement (voir CLAUDE.md §4). Cette
 * indirection existe pour que le jour où une deuxième langue arrive, seul ce
 * module change — jamais les composants qui appellent `t()`.
 */
const dictionary = fr;

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Leaves<T> = T extends string ? '' : { [K in keyof T]: Join<K & string, Leaves<T[K]>> }[keyof T];

/** Toute clé valide de `fr.json`, en notation pointée (ex. "common.retry"). */
export type TranslationKey = Leaves<typeof dictionary>;

function resolve(node: unknown, parts: string[]): unknown {
  const [head, ...rest] = parts;
  if (head === undefined) {
    return node;
  }
  if (typeof node === 'object' && node !== null && head in node) {
    return resolve((node as Record<string, unknown>)[head], rest);
  }
  return undefined;
}

/**
 * Seule voie d'accès à une chaîne visible. Aucune chaîne en dur dans un
 * composant (CLAUDE.md §4, invariant de code n°14 / définition de « terminé »).
 */
export function t(key: TranslationKey): string {
  const value = resolve(dictionary, key.split('.'));
  if (typeof value !== 'string') {
    throw new Error(`Nurtura i18n: clé de traduction manquante "${key}"`);
  }
  return value;
}
