import { describe, expect, it } from 'vitest';
import { isFetchError } from '../privateHelper';

describe('isFetchError', () => {
  it('returns true for the canonical fetch network failure', () => {
    const err = new TypeError('Failed to fetch');
    expect(isFetchError(err)).toBe(true);
  });

  it('returns false for a TypeError with a different message', () => {
    expect(isFetchError(new TypeError('something else'))).toBe(false);
  });

  it('returns false for non-TypeError Errors with the same message', () => {
    const err = new Error('Failed to fetch');
    expect(isFetchError(err)).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isFetchError(undefined)).toBe(false);
    expect(isFetchError(null)).toBe(false);
    expect(isFetchError('Failed to fetch')).toBe(false);
    expect(
      isFetchError({ name: 'TypeError', message: 'Failed to fetch' }),
    ).toBe(false);
  });
});
