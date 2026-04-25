import { describe, expect, it } from 'vitest';
import { scheduleURL } from '../url';

describe('scheduleURL', () => {
  it('joins the base URL with the schedule view path and event id', () => {
    expect(scheduleURL('https://example.cybozu.com/g', 'evt-123')).toBe(
      'https://example.cybozu.com/g/schedule/view?event=evt-123',
    );
  });

  // Current implementation does not normalise trailing slashes in baseURL;
  // lock the behaviour in so future refactors are intentional.
  it('does not strip a trailing slash from baseURL (golden behavior)', () => {
    expect(scheduleURL('https://example.cybozu.com/g/', 'evt-1')).toBe(
      'https://example.cybozu.com/g//schedule/view?event=evt-1',
    );
  });

  it('passes the event id through unchanged (no encoding)', () => {
    expect(scheduleURL('https://x.example/g', 'a b')).toBe(
      'https://x.example/g/schedule/view?event=a b',
    );
  });
});
