import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ClientEvent, DeviceClass, EventPayloadMap, EventType } from './eventTypes';
import { EVENT_SCHEMA_VERSION } from './eventTypes';

/**
 * File locale du journal d'événements comportementaux — EVENEMENTS.md §7, §8.
 *
 * Ce module fait exactement deux choses, comme demandé : enregistrer un
 * événement conforme au schéma dans une file locale persistante (`track`),
 * et rejouer cette file vers une destination (`flush`). Rien d'autre :
 * aucune métrique, aucun tableau de bord, aucune règle de détection
 * (EVENEMENTS.md §8).
 *
 * `flush` envoie vers un `EventSink` factice tant que le backend n'est pas
 * tranché (DECISIONS-OUVERTES.md §2.1) — l'idempotence à l'ingestion
 * (dédoublonnage par `event_id`) est une responsabilité du futur backend,
 * pas de ce module ; ce module garantit seulement qu'un rejeu ne perd et ne
 * duplique jamais silencieusement les événements de la file locale.
 */

const QUEUE_STORAGE_KEY = 'nurturia.events.queue';

export type EventContext = {
  /** Identifiant pseudonyme de l'enfant actif — jamais un prénom (EVENEMENTS.md §2). */
  child_ref: string | null;
  session_ref: string | null;
  task_ref: string | null;
  app_version: string;
  device_class: DeviceClass;
};

let context: EventContext = {
  child_ref: null,
  session_ref: null,
  task_ref: null,
  app_version: 'dev',
  device_class: 'phone',
};

/**
 * À appeler par l'appelant (bascule de mode, démarrage de session/tâche)
 * pour tenir à jour le contexte ambiant que `track` attache à chaque
 * événement. Non câblé depuis un écran dans cette session — voir le journal
 * de session pour ce qui reste à faire.
 */
export function setEventContext(patch: Partial<EventContext>): void {
  context = { ...context, ...patch };
}

/** Test-only : remet le contexte ambiant à son état initial. */
export function __resetEventContext(): void {
  context = { child_ref: null, session_ref: null, task_ref: null, app_version: 'dev', device_class: 'phone' };
}

function generateEventId(): string {
  const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();

  // Repli si `crypto.randomUUID` est indisponible sur le runtime Hermes visé.
  // Pas cryptographiquement fort — inutile ici : `event_id` sert à
  // l'idempotence du rejeu, pas à la sécurité.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (placeholder) => {
    const random = (Math.random() * 16) | 0;
    const value = placeholder === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * `local_tz` et `local_time` sont dénormalisés à l'écriture (EVENEMENTS.md
 * principe 6) : reconstituer un fuseau historique des mois plus tard est une
 * source d'erreurs silencieuses, donc on ne recalcule jamais après coup.
 */
function localTimeParts(date: Date): { local_tz: string; local_time: string; local_dow: number } {
  let local_tz = 'UTC';
  try {
    local_tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch {
    // Intl indisponible sur le runtime — UTC par défaut plutôt qu'un échec de journalisation.
  }
  return {
    local_tz,
    local_time: date.toTimeString().slice(0, 8),
    local_dow: date.getDay(),
  };
}

async function readQueue(): Promise<ClientEvent[]> {
  const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as ClientEvent[];
}

async function writeQueue(queue: ClientEvent[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Enregistre un fait comportemental dans la file locale. `T` lie `eventType`
 * à la forme de `payload` définie dans `eventTypes.ts` : un appel avec une
 * charge utile non conforme au schéma échoue à la compilation, pas à
 * l'exécution (EVENEMENTS.md §8).
 *
 * Lève si `child_ref` n'est pas encore posé via `setEventContext` : ce
 * champ n'est jamais optionnel dans l'enveloppe (EVENEMENTS.md §2), donc
 * appeler `track` avant qu'un enfant actif soit connu est une erreur de
 * l'appelant, pas un cas à absorber silencieusement.
 */
export async function track<T extends EventType>(eventType: T, payload: EventPayloadMap[T]): Promise<void> {
  if (context.child_ref === null) {
    throw new Error(
      `track("${eventType}") appelé sans child_ref actif — appeler setEventContext({ child_ref }) d'abord.`,
    );
  }

  const now = new Date();
  const event: ClientEvent<T> = {
    event_id: generateEventId(),
    schema_version: EVENT_SCHEMA_VERSION,
    event_type: eventType,
    child_ref: context.child_ref,
    session_ref: context.session_ref,
    task_ref: context.task_ref,
    client_ts: now.getTime(),
    ...localTimeParts(now),
    app_version: context.app_version,
    device_class: context.device_class,
    payload,
  };

  const queue = await readQueue();
  queue.push(event as ClientEvent);
  await writeQueue(queue);
}

export type EventSink = (events: readonly ClientEvent[]) => Promise<void>;

/**
 * Sink de démonstration — DECISIONS-OUVERTES.md §2.1 (backend non tranché).
 * Journalise en console en développement et ne fait rien d'autre. Ne lève
 * jamais : c'est une trace de dev, pas un contrat à honorer. À remplacer par
 * un appel réseau réel le jour où le backend est choisi.
 */
export const demoEventSink: EventSink = async (events) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(`[events] flush factice de ${events.length} événement(s)`, events);
  }
};

/**
 * Rejoue la file locale vers `sink`. La file n'est vidée qu'après le succès
 * du sink : un échec la laisse intacte pour le prochain essai, et comme
 * chaque événement porte un `event_id` stable, renvoyer deux fois la même
 * file ne duplique rien côté ingestion idempotente (EVENEMENTS.md
 * principe 7). Si la file est vide, `sink` n'est pas appelé.
 */
export async function flush(sink: EventSink = demoEventSink): Promise<void> {
  const queue = await readQueue();
  if (queue.length === 0) return;
  await sink(queue);
  await writeQueue([]);
}

/** Lecture seule de la file en attente — debug et tests. */
export async function getQueuedEvents(): Promise<readonly ClientEvent[]> {
  return readQueue();
}

/** Test-only : vide la file sans passer par un sink. */
export async function __clearEventQueue(): Promise<void> {
  await writeQueue([]);
}
