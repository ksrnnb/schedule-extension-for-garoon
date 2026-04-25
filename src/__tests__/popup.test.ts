import { describe, expect, it } from 'vitest';
import { isTodayEvent, getEventState } from '../popup';
import { buildEvent } from '../../test/fixtures/events';

// 2026-04-25 12:00 local time — mid-day snapshot for "now"
const NOW_LOCAL = new Date(2026, 3, 25, 12, 0, 0);
const NOW = NOW_LOCAL.getTime();
const TODAY_START = new Date(2026, 3, 25, 0, 0, 0);
const TOMORROW_START = new Date(2026, 3, 26, 0, 0, 0);

const at = (h: number, m: number = 0): Date => new Date(2026, 3, 25, h, m, 0);

describe('isTodayEvent', () => {
  it('returns true for an event contained within today', () => {
    const ev = buildEvent({ start: at(10), end: at(11) });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(true);
  });

  it('returns true for a cross-midnight event that ends today', () => {
    const ev = buildEvent({
      start: new Date(2026, 3, 24, 23, 0, 0),
      end: at(1),
    });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(true);
  });

  it('returns false for an event that ended exactly at midnight (not strictly after todayStart)', () => {
    const ev = buildEvent({
      start: new Date(2026, 3, 24, 22, 0, 0),
      end: new Date(2026, 3, 25, 0, 0, 0),
    });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(false);
  });

  it('returns false for a tomorrow event', () => {
    const ev = buildEvent({
      start: new Date(2026, 3, 26, 10, 0, 0),
      end: new Date(2026, 3, 26, 11, 0, 0),
    });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(false);
  });

  it('returns false for an event starting exactly at tomorrowStart', () => {
    const ev = buildEvent({ start: new Date(2026, 3, 26, 0, 0, 0) });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(false);
  });

  it('falls back to start as end when no end.dateTime is present (single-instant)', () => {
    // buildEvent defaults end to start when omitted — event at 14:00 is today
    const ev = buildEvent({ start: at(14) });
    expect(isTodayEvent(ev, TODAY_START, TOMORROW_START)).toBe(true);
  });
});

describe('getEventState', () => {
  it('marks an event as past when its end is before now', () => {
    const ev = buildEvent({ start: at(9), end: at(10) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: true, isOngoing: false });
  });

  it('marks an event as past when end === now (boundary: lastTime <= now)', () => {
    const ev = buildEvent({ start: at(11), end: NOW_LOCAL });
    expect(getEventState(ev, NOW)).toEqual({ isPast: true, isOngoing: false });
  });

  it('marks an event as ongoing when start <= now < end', () => {
    const ev = buildEvent({ start: at(11), end: at(13) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: false, isOngoing: true });
  });

  it('marks an event as ongoing when start === now (start <= now holds)', () => {
    const ev = buildEvent({ start: NOW_LOCAL, end: at(13) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: false, isOngoing: true });
  });

  it('marks an event as upcoming when start > now', () => {
    const ev = buildEvent({ start: at(15), end: at(16) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: false, isOngoing: false });
  });

  it('treats all-day events as neither past nor ongoing regardless of time', () => {
    const pastAllDay = buildEvent({ start: at(0), isAllDay: true });
    expect(getEventState(pastAllDay, NOW)).toEqual({
      isPast: false,
      isOngoing: false,
    });
  });

  it('uses start as end when end.dateTime is absent — past if start < now', () => {
    // buildEvent sets end.dateTime === start.dateTime when end is omitted
    const ev = buildEvent({ start: at(10) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: true, isOngoing: false });
  });

  it('uses start as end — upcoming if start > now', () => {
    const ev = buildEvent({ start: at(15) });
    expect(getEventState(ev, NOW)).toEqual({ isPast: false, isOngoing: false });
  });
});
