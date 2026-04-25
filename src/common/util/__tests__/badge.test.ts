import { describe, expect, it } from 'vitest';
import { nextEventToday } from '../badge';
import { buildEvent } from '../../../../test/fixtures/events';

// All times are constructed from local-time Date components so the test
// is independent of the host timezone. nextEventToday computes endOfToday
// via setHours(24, 0, 0, 0), which is also local-time, so the boundary
// arithmetic stays consistent across hosts.
const NOW_LOCAL = new Date(2026, 3, 25, 12, 0, 0); // 2026-04-25 12:00 local
const NOW = NOW_LOCAL.getTime();
const END_OF_TODAY = new Date(2026, 3, 26, 0, 0, 0).getTime();

const at = (h: number, m: number = 0): Date => new Date(2026, 3, 25, h, m, 0);

describe('nextEventToday', () => {
  it('returns undefined when events is undefined', () => {
    expect(nextEventToday(undefined, NOW)).toBeUndefined();
  });

  it('returns undefined when events is empty', () => {
    expect(nextEventToday([], NOW)).toBeUndefined();
  });

  it('returns undefined when every candidate is in the past', () => {
    const events = [
      buildEvent({ start: at(8) }),
      buildEvent({ start: at(11, 59) }),
    ];
    expect(nextEventToday(events, NOW)).toBeUndefined();
  });

  it('returns undefined when every candidate is tomorrow or later', () => {
    const tomorrow = new Date(2026, 3, 26, 9, 0, 0);
    const events = [buildEvent({ start: tomorrow })];
    expect(nextEventToday(events, NOW)).toBeUndefined();
  });

  it('finds the next non-all-day event later today', () => {
    const events = [
      buildEvent({ id: 'past', start: at(9) }),
      buildEvent({ id: 'next', start: at(15) }),
      buildEvent({ id: 'later', start: at(17) }),
    ];
    expect(nextEventToday(events, NOW)?.id).toBe('next');
  });

  it('skips all-day events even when they fall within today', () => {
    const events = [
      buildEvent({ id: 'allday', start: at(0), isAllDay: true }),
      buildEvent({ id: 'real', start: at(15) }),
    ];
    expect(nextEventToday(events, NOW)?.id).toBe('real');
  });

  it('returns the FIRST eligible event (Array#find semantics)', () => {
    // Even if the array is not sorted, the function returns the first match.
    const events = [
      buildEvent({ id: 'second', start: at(17) }),
      buildEvent({ id: 'first', start: at(13) }),
    ];
    expect(nextEventToday(events, NOW)?.id).toBe('second');
  });

  it('treats start === now as NOT eligible (strict greater-than)', () => {
    const events = [buildEvent({ id: 'on-the-dot', start: NOW_LOCAL })];
    expect(nextEventToday(events, NOW)).toBeUndefined();
  });

  it('treats start === endOfToday as NOT eligible (strict less-than)', () => {
    const events = [
      buildEvent({ id: 'midnight', start: new Date(END_OF_TODAY) }),
    ];
    expect(nextEventToday(events, NOW)).toBeUndefined();
  });

  it('treats start one ms before endOfToday as eligible', () => {
    const events = [
      buildEvent({ id: 'last-second', start: new Date(END_OF_TODAY - 1) }),
    ];
    expect(nextEventToday(events, NOW)?.id).toBe('last-second');
  });

  it('uses Date.now() as default when now is not provided', () => {
    // Smoke check: with a clearly-in-the-past event and no explicit now,
    // the function still walks the list without throwing, returning
    // either undefined or a future event.
    const result = nextEventToday([
      buildEvent({ start: new Date(2000, 0, 1) }),
    ]);
    expect(result).toBeUndefined();
  });
});
