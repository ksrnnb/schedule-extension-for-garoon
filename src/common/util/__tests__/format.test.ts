import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  badgeTimeString,
  dateString,
  timeString,
  timeZoneOffsetString,
  zeroPad,
} from '../format';

describe('zeroPad', () => {
  it('pads single digits with leading zero (default width 2)', () => {
    expect(zeroPad(5)).toBe('05');
  });

  it('returns the rightmost N characters when input is wider than width', () => {
    expect(zeroPad(123, 2)).toBe('23');
  });

  it('handles zero', () => {
    expect(zeroPad(0)).toBe('00');
  });

  it('respects custom width', () => {
    expect(zeroPad(7, 4)).toBe('0007');
  });
});

describe('dateString', () => {
  it('formats with zero-padded month and day', () => {
    const d = new Date(2026, 0, 5);
    expect(dateString(d)).toBe('2026-01-05');
  });

  it('does not pad already-two-digit values', () => {
    const d = new Date(2026, 11, 31);
    expect(dateString(d)).toBe('2026-12-31');
  });

  it('honours custom separator', () => {
    const d = new Date(2026, 3, 25);
    expect(dateString(d, '/')).toBe('2026/04/25');
  });
});

describe('timeString', () => {
  it('formats HH:MM with zero padding', () => {
    const d = new Date(2026, 3, 25, 9, 7);
    expect(timeString(d)).toBe('09:07');
  });

  it('keeps two-digit hours and minutes intact', () => {
    const d = new Date(2026, 3, 25, 23, 59);
    expect(timeString(d)).toBe('23:59');
  });

  it('honours custom separator', () => {
    const d = new Date(2026, 3, 25, 0, 0);
    expect(timeString(d, '-')).toBe('00-00');
  });
});

describe('badgeTimeString', () => {
  it('does not zero-pad single-digit hours', () => {
    const d = new Date(2026, 3, 25, 8, 0);
    expect(badgeTimeString(d)).toBe('8:00');
  });

  it('keeps two-digit hours intact', () => {
    const d = new Date(2026, 3, 25, 14, 0);
    expect(badgeTimeString(d)).toBe('14:00');
  });

  it('zero-pads single-digit minutes', () => {
    const d = new Date(2026, 3, 25, 9, 7);
    expect(badgeTimeString(d)).toBe('9:07');
  });

  it('honours custom separator', () => {
    const d = new Date(2026, 3, 25, 8, 30);
    expect(badgeTimeString(d, '.')).toBe('8.30');
  });
});

describe('timeZoneOffsetString', () => {
  // Date#getTimezoneOffset returns minutes-from-UTC with the sign reversed:
  // for UTC+9 it returns -540, for UTC-8 it returns +480.
  // Mock it directly so tests are independent of the host timezone.
  const mockOffset = (minutesGetTimezoneOffsetReturns: number) => {
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(
      minutesGetTimezoneOffsetReturns,
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats UTC+9 as +09:00', () => {
    mockOffset(-540);
    expect(timeZoneOffsetString(new Date())).toBe('+09:00');
  });

  it('formats UTC as +00:00', () => {
    mockOffset(0);
    expect(timeZoneOffsetString(new Date())).toBe('+00:00');
  });

  it('honours custom separator for positive offsets', () => {
    mockOffset(-540);
    expect(timeZoneOffsetString(new Date(), '')).toBe('+0900');
  });

  it('formats UTC-8 (PST) as -08:00', () => {
    mockOffset(480);
    expect(timeZoneOffsetString(new Date())).toBe('-08:00');
  });

  it('formats India Standard Time (UTC+5:30) as +05:30', () => {
    mockOffset(-330);
    expect(timeZoneOffsetString(new Date())).toBe('+05:30');
  });

  it('formats Newfoundland Standard Time (UTC-3:30) as -03:30', () => {
    mockOffset(210);
    expect(timeZoneOffsetString(new Date())).toBe('-03:30');
  });
});
