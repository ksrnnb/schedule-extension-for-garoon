/**
 * Garoon Notificator background script.
 */

import {
  clearError,
  initNotificationEvent,
  notify,
  playChime,
  requireAuth,
  setError,
  timeString,
  updateBadge,
  __,
} from './common';
import { GaroonAPI, ScheduleEvent, ErrorResponse } from './common/api';
import * as store from './common/store';
import * as message from './common/background';

async function update() {
  try {
    const { baseURL } = await store.load();
    if (!baseURL) {
      return await setError(__('err_no_base_url'));
    }

    await updateScheduleEvents(baseURL);

    await store.save({ lastUpdate: Date.now() });

    await clearError();
  } catch (e) {
    if (e instanceof ErrorResponse && e.status() === 401) {
      requireAuth();
      return;
    }
    throw e;
  }
}

async function updateScheduleEvents(baseURL: string) {
  const data = await new GaroonAPI(baseURL).getScheduleEvents();

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // keep events from today 0:00 through 30 days ahead, so the popup can show
  // already-finished events from earlier today.
  const events = data.events.filter(ev => {
    const start = new Date(ev.start.dateTime).getTime();
    return start >= todayStart.getTime() && start - now < 30 * 86400000;
  });
  await store.save({ events: events });
}

async function notifyEvents() {
  const {
    events,
    notifiesEvents,
    notifyMinutesBefore,
    ignoreEventKeywords,
    playsSound,
    soundVolume,
    baseURL,
  } = await store.load();
  if (!notifiesEvents) {
    return;
  }

  const duration = notifyMinutesBefore || 0;
  const ignoreKeywords = ignoreEventKeywords
    .split('\n')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const curMin = Math.round(Date.now() / 60000);
  events
    ?.filter(ev => {
      const subject = ev.subject.toLowerCase();
      return !ignoreKeywords.some(s => subject.includes(s));
    })
    .forEach(ev => {
      const startMin = Math.floor(
        new Date(ev.start.dateTime).getTime() / 60000,
      );
      if (curMin + duration === startMin) {
        notifyEvent(
          ev,
          baseURL &&
            `${baseURL.replace(/\/+$/, '')}/schedule/view?event=${ev.id}`,
          duration,
          playsSound ? soundVolume : undefined,
        );
      }
    });
}

async function notifyEvent(
  ev: ScheduleEvent,
  url?: string,
  duration?: number,
  volume?: number,
) {
  const title = ev.eventMenu ? `${ev.eventMenu}: ${ev.subject}` : ev.subject;
  notify(
    {
      title,
      message:
        (duration ? `${duration} ${__('minutes_before')}: ` : '') + ev.notes,
    },
    {
      onClicked: () => {
        if (url) {
          chrome.tabs.create({
            url,
          });
        }
      },
    },
  );
  if (volume !== undefined) {
    playChime(volume).catch(e => console.warn('playChime failed', e));
  }
}

function run() {
  chrome.runtime.onInstalled.addListener(details => {
    console.info(`installed reason: ${details.reason}`);
    if (details.reason === 'install') {
      store.reset();
    }
  });

  initNotificationEvent();

  chrome.alarms.onAlarm.addListener(async alarm => {
    try {
      await notifyEvents();

      const { refreshInMinutes, lastUpdate } = await store.load();
      const minutes = Math.round((Date.now() - (lastUpdate || 0)) / 60000);

      if (refreshInMinutes <= minutes) {
        await update();

        const {
          lastUpdate: last,
          events,
          error,
        } = await store.load();

        console.info(
          'update',
          timeString(new Date()),
          refreshInMinutes <= minutes,
          {
            update: last,
            error,
            events,
          },
        );
      }

      await updateBadge();
    } catch (e) {
      console.warn('caught error', e instanceof Error ? e : JSON.stringify(e));
    }
  });

  message.listen(message.Type.Update, update);

  chrome.alarms.create('watchNotification', {
    periodInMinutes: 1,
  });

  update();
}

run();
