export function isValidBaseURL(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.host.endsWith('.cybozu.com');
  } catch {
    return false;
  }
}
