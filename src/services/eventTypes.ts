/**
 * Types générés depuis `EVENEMENTS.md` — schéma des événements comportementaux
 * (résout DECISIONS-OUVERTES.md §3.6). `EventPayloadMap` est la source de
 * vérité : `EVENEMENTS.md` en est la spécification lisible, ce fichier en est
 * la version qui échoue à la compilation si elle diverge. Toute modification
 * de payload doit être faite dans les deux à la fois.
 *
 * Ne contient QUE la structure des événements — aucune métrique dérivée,
 * aucune règle de détection (EVENEMENTS.md §5, §8).
 */

export const EVENT_SCHEMA_VERSION = 1;

export type DeviceClass = 'phone' | 'tablet';

/**
 * Un payload vide et typé strictement : `Record<string, never>` refuse toute
 * clé, contrairement à `{}` qui accepterait n'importe quel objet en
 * TypeScript.
 */
type EmptyPayload = Record<string, never>;

/**
 * §3 — un type d'événement, une charge utile. Aucun champ texte libre nulle
 * part (EVENEMENTS.md principe 4) : durées, index, codes et énumérations
 * uniquement.
 */
export type EventPayloadMap = {
  // 3.1 Session
  session_started: { entry_point: string; subject_ref?: string; resumed_from_task_ref?: string };
  session_paused: { reason: 'backgrounded' | 'call' | 'idle' };
  session_resumed: { pause_duration_ms: number };
  session_ended: {
    reason: 'completed' | 'window_closed' | 'abandoned' | 'timeout';
    duration_ms: number;
    active_duration_ms: number;
  };

  // 3.2 Tâche
  task_started: { subject_ref: string; notion_ref?: string; origin: 'new' | 'resumed' | 'suggested' };
  // Pas de valeur `failed` dans `outcome` — volontaire, EVENEMENTS.md §3.2 : le produit n'évalue pas la justesse.
  task_ended: {
    outcome: 'resolved_by_child' | 'abandoned' | 'interrupted' | 'window_closed';
    duration_ms: number;
    turn_count: number;
    hint_count: number;
    attempt_count: number;
  };

  // 3.3 Tour de conversation — le grain porteur
  turn_prompted: { turn_index: number; coach_intent_code?: string };
  child_input_started: { latency_to_first_input_ms: number; input_mode: 'text' | 'voice' };
  child_input_submitted: {
    composition_duration_ms: number;
    edit_count: number;
    length_chars: number;
    voice_duration_ms?: number;
    submitted_after_idle_ms: number;
  };
  coach_responded: { response_type_code: string; generation_latency_ms: number };

  // 3.4 Recours à l'aide
  hint_requested: {
    requested_by: 'child' | 'coach_offered';
    time_since_task_start_ms: number;
    time_since_last_hint_ms: number;
    hint_level: number;
  };
  hint_delivered: { hint_level: number };
  hint_declined: { offered_level: number };
  answer_demanded: { insistence_index: number; time_since_task_start_ms: number };
  answer_refused_by_coach: { refusal_index: number };
  post_refusal_behaviour: {
    outcome: 'continued' | 'abandoned_task' | 'abandoned_session';
    delay_ms: number;
  };

  // 3.5 Persévérance et décrochage
  idle_detected: { idle_ms: number; context_code: string };
  retry_attempt: { attempt_index: number; time_since_previous_attempt_ms: number };
  task_abandoned: { after_ms: number; after_attempts: number; after_hints: number; last_activity_ms: number };
  app_backgrounded: { during_task: boolean };
  app_foregrounded: { away_duration_ms: number };

  // 3.6 Créneau horaire et exceptions
  window_opened: { window_ref: string };
  window_closed: { window_ref: string };
  blocked_attempt: { attempted_at_local_time: string; minutes_from_window: number };
  extension_requested: { requested_minutes: number; context_task_ref?: string };
  extension_granted: { parent_response_delay_ms: number };
  extension_denied: { parent_response_delay_ms: number };
  extension_expired: { waited_ms: number };

  // 3.7 Côté parent
  voice_note_generated: { generation_status: string; duration_s: number };
  voice_note_played: { delay_from_generation_ms: number; played_ratio: number; completed: boolean };
  insight_viewed: { insight_code: string; dwell_ms: number };
  setting_changed: { setting_key: string; from_code: string; to_code: string };
  advanced_settings_opened: EmptyPayload;
  onboarding_step_completed: { step_index: number; duration_ms: number };
  onboarding_abandoned: { step_index: number; duration_ms: number };
  mode_switched: { from: string; to: string; unlock_method: 'pin' | 'biometric' };

  // 3.8 Sécurité et signalement — structure seule, aucune logique de détection (DECISIONS-OUVERTES.md §3.7)
  conversation_flagged: { flagged_by: 'parent' | 'child' | 'system'; reason_code?: string };
  safety_signal_raised: { signal_code: string; severity_code: string };
};

export type EventType = keyof EventPayloadMap;

/**
 * §2 — enveloppe commune produite côté client. `server_received_ts` et
 * `clock_skew_ms` en sont volontairement absents : ce sont des champs posés
 * à l'ingestion (voir `IngestedEvent`), pas par l'appareil.
 */
export type ClientEventEnvelope = {
  event_id: string;
  schema_version: number;
  child_ref: string;
  session_ref: string | null;
  task_ref: string | null;
  client_ts: number;
  local_tz: string;
  local_time: string;
  local_dow: number;
  app_version: string;
  device_class: DeviceClass;
};

export type ClientEvent<T extends EventType = EventType> = ClientEventEnvelope & {
  event_type: T;
  payload: EventPayloadMap[T];
};

/**
 * Événement tel qu'il existe après ingestion (§2 complet). Aucun code de ce
 * dépôt ne produit ce type aujourd'hui — le backend n'est pas tranché
 * (DECISIONS-OUVERTES.md §2.1) — mais la forme est fixée dès maintenant pour
 * ne pas avoir à migrer le schéma le jour où il existe.
 */
export type IngestedEvent<T extends EventType = EventType> = ClientEvent<T> & {
  server_received_ts: number;
  clock_skew_ms: number;
};
