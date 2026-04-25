import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildScheduleEventsRangeStart } from '../API';

// Date#getTimezoneOffset returns minutes-from-UTC with the sign reversed:
// JST(-540), UTC(0), PST(+480), IST(-330).
const mockTzOffset = (mins: number) => {
  vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(mins);
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildScheduleEventsRangeStart', () => {
  it('returns the same date one month earlier at local midnight (JST)', () => {
    mockTzOffset(-540);
    const today = new Date(2026, 3, 25, 12, 30, 45); // April 25, 2026 (local)
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2026-03-25T00:00:00+09:00',
    );
  });

  it('rolls back to previous December when today is in January', () => {
    mockTzOffset(-540);
    const today = new Date(2026, 0, 15);
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2025-12-15T00:00:00+09:00',
    );
  });

  it('zero-pads single-digit month and day', () => {
    mockTzOffset(-540);
    const today = new Date(2026, 1, 9); // Feb 9 → Jan 9
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2026-01-09T00:00:00+09:00',
    );
  });

  it('emits a negative offset for west-of-UTC zones (PST)', () => {
    mockTzOffset(480);
    const today = new Date(2026, 3, 25);
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2026-03-25T00:00:00-08:00',
    );
  });

  it('renders sub-hour offsets (India Standard Time, UTC+5:30)', () => {
    mockTzOffset(-330);
    const today = new Date(2026, 3, 25);
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2026-03-25T00:00:00+05:30',
    );
  });

  it('emits "+00:00" for UTC', () => {
    mockTzOffset(0);
    const today = new Date(2026, 3, 25);
    expect(buildScheduleEventsRangeStart(today)).toBe(
      '2026-03-25T00:00:00+00:00',
    );
  });

  it('uses today (now) by default when no argument is provided', () => {
    // Smoke check: returns a string with the expected ISO-8601 shape.
    mockTzOffset(-540);
    expect(buildScheduleEventsRangeStart()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
    );
  });
});
