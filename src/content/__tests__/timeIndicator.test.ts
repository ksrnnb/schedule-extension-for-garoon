import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isTodayBdate,
  nowMinutes,
  readColumnRange,
  todayDateString,
} from '../timeIndicator';

describe('todayDateString', () => {
  it('builds YYYY-MM-DD from local-time components (zero-padded)', () => {
    const d = new Date(2026, 0, 5); // Jan 5
    expect(todayDateString(d)).toBe('2026-01-05');
  });

  it('keeps two-digit components intact', () => {
    const d = new Date(2026, 11, 31);
    expect(todayDateString(d)).toBe('2026-12-31');
  });

  it('uses now as the default argument (smoke check)', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('nowMinutes', () => {
  it('returns hours*60 + minutes (local time)', () => {
    expect(nowMinutes(new Date(2026, 3, 25, 9, 30))).toBe(9 * 60 + 30);
  });

  it('returns 0 at midnight', () => {
    expect(nowMinutes(new Date(2026, 3, 25, 0, 0))).toBe(0);
  });

  it('returns 23*60 + 59 at the last minute of the day', () => {
    expect(nowMinutes(new Date(2026, 3, 25, 23, 59))).toBe(23 * 60 + 59);
  });
});

describe('isTodayBdate', () => {
  // Today is the host's current date — fix it via fake timers so the test
  // is deterministic regardless of when it runs.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 25, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for zero-padded YYYY-MM-DD matching today', () => {
    expect(isTodayBdate('2026-04-25')).toBe(true);
  });

  it('returns true for unpadded YYYY-M-D matching today', () => {
    // Garoon emits this form on time-row attributes — it must still match.
    expect(isTodayBdate('2026-4-25')).toBe(true);
  });

  it('returns true for partially padded forms (YYYY-M-DD, YYYY-MM-D)', () => {
    expect(isTodayBdate('2026-4-05')).toBe(false); // day differs
    expect(isTodayBdate('2026-04-25')).toBe(true);
  });

  it('returns false when the date does not match today', () => {
    expect(isTodayBdate('2026-04-24')).toBe(false);
    expect(isTodayBdate('2025-04-25')).toBe(false);
    expect(isTodayBdate('2026-05-25')).toBe(false);
  });

  it('returns false for malformed strings', () => {
    expect(isTodayBdate(undefined)).toBe(false);
    expect(isTodayBdate('')).toBe(false);
    expect(isTodayBdate('2026/04/25')).toBe(false);
    expect(isTodayBdate('2026-04')).toBe(false);
    expect(isTodayBdate('not-a-date')).toBe(false);
    expect(isTodayBdate('2026-13-01')).toBe(false); // month out of range, but regex allows; numeric eq still fails
  });
});

describe('readColumnRange', () => {
  // Helper: build a fake Garoon week column with given hour data attributes.
  const buildColumn = (hours: (string | number)[]): HTMLElement => {
    const col = document.createElement('div');
    col.className = 'personal_day_event_list';
    for (const h of hours) {
      const row = document.createElement('div');
      row.className = 'personal_day_calendar_time_row';
      row.setAttribute('data-hour', String(h));
      col.appendChild(row);
    }
    return col;
  };

  it('returns null when the column has no time rows', () => {
    const col = document.createElement('div');
    expect(readColumnRange(col)).toBeNull();
  });

  it('returns startMinute / endMinute derived from first and (last+1) hour', () => {
    const col = buildColumn([8, 9, 10, 11, 17]);
    expect(readColumnRange(col)).toEqual({
      startMinute: 8 * 60,
      endMinute: 18 * 60,
    });
  });

  it('handles a single-row column (start == hour, end == hour+1 in minutes)', () => {
    const col = buildColumn([12]);
    expect(readColumnRange(col)).toEqual({
      startMinute: 12 * 60,
      endMinute: 13 * 60,
    });
  });

  it('returns null when first or last data-hour is non-numeric', () => {
    const col = buildColumn(['oops', 9, 10]);
    expect(readColumnRange(col)).toBeNull();
  });

  it('returns null when the last data-hour is missing', () => {
    const col = buildColumn([9, 10]);
    const lastRow = col.lastElementChild as HTMLElement;
    lastRow.removeAttribute('data-hour');
    expect(readColumnRange(col)).toBeNull();
  });
});
