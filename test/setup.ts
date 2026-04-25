import { afterEach, beforeEach, vi } from 'vitest';
import { createChromeFake, ChromeFake } from './fakes/chrome';

export function chromeFake(): ChromeFake {
  return (globalThis as unknown as { chrome: ChromeFake }).chrome;
}

beforeEach(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = createChromeFake();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
