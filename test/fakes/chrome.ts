import { vi } from 'vitest';

type StorageArea = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};

export interface ChromeFake {
  storage: { local: StorageArea };
  i18n: { getMessage: ReturnType<typeof vi.fn> };
  action: {
    setIcon: ReturnType<typeof vi.fn>;
    setBadgeText: ReturnType<typeof vi.fn>;
    setBadgeBackgroundColor: ReturnType<typeof vi.fn>;
  };
  notifications: {
    create: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    onClicked: { addListener: ReturnType<typeof vi.fn> };
    onShowSettings: { addListener: ReturnType<typeof vi.fn> };
  };
  alarms: {
    create: ReturnType<typeof vi.fn>;
    onAlarm: { addListener: ReturnType<typeof vi.fn> };
  };
  runtime: {
    onInstalled: { addListener: ReturnType<typeof vi.fn> };
    onMessage: {
      addListener: ReturnType<typeof vi.fn>;
      removeListener: ReturnType<typeof vi.fn>;
    };
    sendMessage: ReturnType<typeof vi.fn>;
    getURL: ReturnType<typeof vi.fn>;
    getContexts: ReturnType<typeof vi.fn>;
    ContextType: { OFFSCREEN_DOCUMENT: 'OFFSCREEN_DOCUMENT' };
  };
  tabs: { create: ReturnType<typeof vi.fn> };
  offscreen: {
    createDocument: ReturnType<typeof vi.fn>;
    Reason: { AUDIO_PLAYBACK: 'AUDIO_PLAYBACK' };
  };
  __storage: Map<string, unknown>;
  __reset: () => void;
}

export function createChromeFake(): ChromeFake {
  const storage = new Map<string, unknown>();

  const local: StorageArea = {
    get: vi.fn((cb?: (items: Record<string, unknown>) => void) => {
      const items: Record<string, unknown> = {};
      storage.forEach((v, k) => (items[k] = v));
      cb?.(items);
      return Promise.resolve(items);
    }),
    set: vi.fn((items: Record<string, unknown>, cb?: () => void) => {
      Object.entries(items).forEach(([k, v]) => storage.set(k, v));
      cb?.();
      return Promise.resolve();
    }),
    remove: vi.fn((key: string | string[], cb?: () => void) => {
      const keys = Array.isArray(key) ? key : [key];
      keys.forEach(k => storage.delete(k));
      cb?.();
      return Promise.resolve();
    }),
    clear: vi.fn((cb?: () => void) => {
      storage.clear();
      cb?.();
      return Promise.resolve();
    }),
  };

  const fake: ChromeFake = {
    storage: { local },
    i18n: {
      getMessage: vi.fn((key: string) => `__msg(${key})`),
    },
    action: {
      setIcon: vi.fn(),
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
    notifications: {
      create: vi.fn((id: string, _opts: unknown, cb?: (id: string) => void) => {
        cb?.(id);
      }),
      clear: vi.fn(),
      onClicked: { addListener: vi.fn() },
      onShowSettings: { addListener: vi.fn() },
    },
    alarms: {
      create: vi.fn(),
      onAlarm: { addListener: vi.fn() },
    },
    runtime: {
      onInstalled: { addListener: vi.fn() },
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
      sendMessage: vi.fn(),
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      getContexts: vi.fn(() => Promise.resolve([])),
      ContextType: { OFFSCREEN_DOCUMENT: 'OFFSCREEN_DOCUMENT' },
    },
    tabs: { create: vi.fn() },
    offscreen: {
      createDocument: vi.fn(() => Promise.resolve()),
      Reason: { AUDIO_PLAYBACK: 'AUDIO_PLAYBACK' },
    },
    __storage: storage,
    __reset: () => {
      storage.clear();
    },
  };

  return fake;
}
