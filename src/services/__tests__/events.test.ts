import AsyncStorage from '@react-native-async-storage/async-storage';

import { __clearEventQueue, __resetEventContext, flush, getQueuedEvents, setEventContext, track } from '../events';
import type { EventPayloadMap } from '../eventTypes';

describe('events', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetEventContext();
  });

  describe('track', () => {
    it('lève si aucun child_ref actif — le champ est obligatoire dans l’enveloppe (EVENEMENTS.md §2)', async () => {
      await expect(track('session_started', { entry_point: 'today_screen' })).rejects.toThrow(/child_ref/);
    });

    it('empile un événement conforme dans la file locale une fois le contexte posé', async () => {
      setEventContext({ child_ref: 'child-abc', session_ref: 'session-1' });
      await track('session_started', { entry_point: 'today_screen' });

      const queue = await getQueuedEvents();
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        event_type: 'session_started',
        schema_version: 1,
        child_ref: 'child-abc',
        session_ref: 'session-1',
        task_ref: null,
        payload: { entry_point: 'today_screen' },
      });
    });

    it('pose une enveloppe complète : event_id, horodatage local, app_version, device_class', async () => {
      setEventContext({ child_ref: 'child-abc', app_version: '1.2.3', device_class: 'tablet' });
      await track('session_started', { entry_point: 'today_screen' });

      const [event] = await getQueuedEvents();
      expect(event!.event_id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(typeof event!.client_ts).toBe('number');
      expect(typeof event!.local_tz).toBe('string');
      expect(event!.local_time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(event!.local_dow).toBeGreaterThanOrEqual(0);
      expect(event!.local_dow).toBeLessThanOrEqual(6);
      expect(event!.app_version).toBe('1.2.3');
      expect(event!.device_class).toBe('tablet');
    });

    it('deux événements successifs reçoivent des event_id distincts', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('session_started', { entry_point: 'today_screen' });
      await track('session_ended', { reason: 'completed', duration_ms: 1000, active_duration_ms: 900 });

      const queue = await getQueuedEvents();
      expect(queue).toHaveLength(2);
      expect(queue[0]!.event_id).not.toBe(queue[1]!.event_id);
    });

    it('n’écrit jamais de texte libre dans la charge utile (EVENEMENTS.md principe 4)', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('child_input_submitted', {
        composition_duration_ms: 4200,
        edit_count: 2,
        length_chars: 37,
        submitted_after_idle_ms: 1500,
      });

      const [event] = await getQueuedEvents();
      const payload = event!.payload as EventPayloadMap['child_input_submitted'];
      expect(Object.values(payload).every((value) => typeof value === 'number')).toBe(true);
    });

    it('écrit la file dans AsyncStorage — persistée sur l’appareil, pas seulement en mémoire du module', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('session_started', { entry_point: 'today_screen' });

      const raw = await AsyncStorage.getItem('nurturia.events.queue');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toHaveLength(1);
    });
  });

  describe('flush', () => {
    it('n’appelle pas le sink et ne touche pas la file si elle est vide', async () => {
      const sink = jest.fn().mockResolvedValue(undefined);
      await flush(sink);
      expect(sink).not.toHaveBeenCalled();
    });

    it('envoie la file complète au sink puis la vide en cas de succès', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('session_started', { entry_point: 'today_screen' });
      await track('session_ended', { reason: 'completed', duration_ms: 1000, active_duration_ms: 900 });

      const sink = jest.fn().mockResolvedValue(undefined);
      await flush(sink);

      expect(sink).toHaveBeenCalledTimes(1);
      expect(sink.mock.calls[0]![0]).toHaveLength(2);
      expect(await getQueuedEvents()).toHaveLength(0);
    });

    it('laisse la file intacte si le sink échoue, pour un rejeu ultérieur', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('session_started', { entry_point: 'today_screen' });

      const failingSink = jest.fn().mockRejectedValue(new Error('réseau indisponible'));
      await expect(flush(failingSink)).rejects.toThrow('réseau indisponible');

      expect(await getQueuedEvents()).toHaveLength(1);
    });

    it('un rejeu après échec renvoie les mêmes event_id — l’idempotence à l’ingestion repose là-dessus', async () => {
      setEventContext({ child_ref: 'child-abc' });
      await track('session_started', { entry_point: 'today_screen' });
      const [originalEvent] = await getQueuedEvents();

      const failingSink = jest.fn().mockRejectedValue(new Error('réseau indisponible'));
      await expect(flush(failingSink)).rejects.toThrow();

      const succeedingSink = jest.fn().mockResolvedValue(undefined);
      await flush(succeedingSink);

      expect(succeedingSink.mock.calls[0]![0]![0].event_id).toBe(originalEvent!.event_id);
    });
  });

  describe('setEventContext', () => {
    it('fusionne les changements sans écraser les champs non fournis', async () => {
      setEventContext({ child_ref: 'child-abc', session_ref: 'session-1' });
      setEventContext({ task_ref: 'task-1' });
      await track('turn_prompted', { turn_index: 0 });

      const [event] = await getQueuedEvents();
      expect(event).toMatchObject({ child_ref: 'child-abc', session_ref: 'session-1', task_ref: 'task-1' });
    });
  });

  afterEach(async () => {
    await __clearEventQueue();
  });
});
