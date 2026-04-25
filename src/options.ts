import * as store from './common/store';
import { defaultConfig } from './common/store';

import { localizeHTML } from './common/util';

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
