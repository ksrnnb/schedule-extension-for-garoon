import { describe, expect, it } from 'vitest';

import { isValidBaseURL } from '../baseUrl';

describe('isValidBaseURL', () => {
  it('accepts an https *.cybozu.com URL', () => {
    expect(isValidBaseURL('https://example.cybozu.com')).toBe(true);
  });

  it('accepts a *.cybozu.com URL with the /g/ path', () => {
    expect(isValidBaseURL('https://example.cybozu.com/g/')).toBe(true);
  });

  it('accepts a multi-level subdomain', () => {
    expect(isValidBaseURL('https://team.example.cybozu.com')).toBe(true);
  });

  it('rejects the apex cybozu.com (no subdomain)', () => {
    expect(isValidBaseURL('https://cybozu.com')).toBe(false);
    expect(isValidBaseURL('https://cybozu.com/g/')).toBe(false);
  });

  it('rejects non-https schemes', () => {
    expect(isValidBaseURL('http://example.cybozu.com')).toBe(false);
  });

  it('rejects on-prem style URLs', () => {
    expect(isValidBaseURL('https://garoon.example.com')).toBe(false);
    expect(isValidBaseURL('https://example.com/scripts/install/grn.exe')).toBe(
      false,
    );
  });

  it('rejects suffix-attack hosts that only end with cybozu.com in the path or fragment', () => {
    expect(isValidBaseURL('https://example.cybozu.com.attacker.com')).toBe(
      false,
    );
    expect(isValidBaseURL('https://attacker.com/.cybozu.com')).toBe(false);
    expect(isValidBaseURL('https://attacker.com#.cybozu.com')).toBe(false);
    expect(isValidBaseURL('https://attacker.com?h=.cybozu.com')).toBe(false);
  });

  it('rejects malformed inputs', () => {
    expect(isValidBaseURL('')).toBe(false);
    expect(isValidBaseURL('not a url')).toBe(false);
    expect(isValidBaseURL('example.cybozu.com')).toBe(false);
  });
});
