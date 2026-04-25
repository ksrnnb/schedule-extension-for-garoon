import { describe, expect, it } from 'vitest';
import { scheduleURL } from '../url';

describe('scheduleURL', () => {
  it('joins the base URL with the schedule view path and event id', () => {
    expect(scheduleURL('https://example.cybozu.com/g', 'evt-123')).toBe(
      'https://example.cybozu.com/g/schedule/view?event=evt-123',
    );
  });

  it('strips a trailing slash from baseURL', () => {
    expect(scheduleURL('https://example.cybozu.com/g/', 'evt-1')).toBe(
      'https://example.cybozu.com/g/schedule/view?event=evt-1',
    );
  });

  it('URL-encodes the event id', () => {
    expect(scheduleURL('https://x.example/g', 'a b')).toBe(
      'https://x.example/g/schedule/view?event=a%20b',
    );
  });
});
