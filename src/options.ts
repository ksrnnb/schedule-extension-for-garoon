import * as store from './common/store';
import { defaultConfig } from './common/store';

import { localizeHTML, playChime } from './common/util';

function input(
  name: string,
  defaultValue?: string | boolean | undefined,
): HTMLInputElement {
  const elem = document.querySelector(
    `input[name=${name}]`,
  ) as HTMLInputElement;
  if (typeof defaultValue === 'string') {
    elem.value = defaultValue;
  } else if (typeof defaultValue === 'boolean') {
    elem.checked = defaultValue;
  }
  return elem;
}

function textarea(
  name: string,
  defaultValue?: string | undefined,
): HTMLTextAreaElement {
  const elem = document.querySelector(
    `textarea[name=${name}]`,
  ) as HTMLTextAreaElement;
  if (typeof defaultValue === 'string') {
    elem.value = defaultValue;
  }
  return elem;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return defaultConfig.soundVolume!;
  return Math.max(0, Math.min(1, n));
}

async function init() {
  localizeHTML();

  const v = await store.load();

  const baseURL = input('base-url', v.baseURL);
  const notifiesEvents = input('notifies-events', v.notifiesEvents);
  const ignoreEventKeywords = textarea(
    'ignore-event-keywords',
    v.ignoreEventKeywords || defaultConfig.ignoreEventKeywords,
  );
  const notifyMinutesBefore = input(
    'notify-minutes-before',
    `${v.notifyMinutesBefore || defaultConfig.notifyMinutesBefore}`,
  );
  const notifiesRequireAuth = input(
    'notifies-require-auth',
    v.notifiesRequireAuth,
  );

  const playsSound = input('plays-sound', v.playsSound);
  const soundVolume = input(
    'sound-volume',
    `${Math.round(clamp01(v.soundVolume ?? defaultConfig.soundVolume!) * 100)}`,
  );
  const soundVolumeValue = document.querySelector<HTMLSpanElement>(
    '.sound-volume-value',
  )!;
  const testSoundButton = document.querySelector<HTMLButtonElement>(
    'button[name=test-sound]',
  )!;

  const updateVolumeLabel = () => {
    soundVolumeValue.textContent = `${soundVolume.value}%`;
  };
  const updateSoundControlsEnabled = () => {
    const enabled = playsSound.checked;
    soundVolume.disabled = !enabled;
    testSoundButton.disabled = !enabled;
  };

  updateVolumeLabel();
  updateSoundControlsEnabled();

  soundVolume.addEventListener('input', updateVolumeLabel);
  playsSound.addEventListener('change', updateSoundControlsEnabled);

  testSoundButton.addEventListener('click', async () => {
    const volume = clamp01(parseInt(soundVolume.value, 10) / 100);
    try {
      await playChime(volume);
    } catch (e) {
      console.warn('test play failed', e);
    }
  });

  document
    .querySelector('#ext-options')!
    .addEventListener('submit', async ev => {
      ev.preventDefault();
      await store.save({
        baseURL: baseURL.value,
        notifiesEvents: notifiesEvents.checked,
        notifyMinutesBefore:
          parseInt(notifyMinutesBefore.value, 10) ||
          defaultConfig.notifyMinutesBefore,
        notifiesRequireAuth: notifiesRequireAuth.checked,
        ignoreEventKeywords: ignoreEventKeywords.value,
        playsSound: playsSound.checked,
        soundVolume: clamp01(parseInt(soundVolume.value, 10) / 100),
      });
      const saved = document.querySelector<HTMLSpanElement>('.saved')!;
      saved.hidden = false;
      saved.classList.add('fade-out');
      setTimeout(() => {
        saved.classList.remove('fade-out');
        saved.hidden = true;
      }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', init);
