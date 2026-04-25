import { ScheduleEvent } from '../api';
import { icons } from '../constants';
import { dateString, timeString } from './message';
import * as store from '../store';

export async function updateBadge() {
  const { error, events } = await store.load();

  if (error) {
    chrome.action.setIcon({ path: icons.GrayLogo });

    const d = new Date();
    console.info(error, `${dateString(d)} ${timeString(d)}`);

    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#e20240' });
    return;
  }

  chrome.action.setIcon({ path: icons.Logo });

  const next = nextEventToday(events);
  if (next) {
    const start = new Date(next.start.dateTime);
    chrome.action.setBadgeText({ text: timeString(start) });
    chrome.action.setBadgeBackgroundColor({ color: '#1f6feb' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function nextEventToday(
  events: ScheduleEvent[] | undefined,
): ScheduleEvent | undefined {
  if (!events) {
    return undefined;
  }
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(24, 0, 0, 0);

  return events.find(ev => {
    if (ev.isAllDay) {
      return false;
    }
    const start = new Date(ev.start.dateTime).getTime();
    return start > now && start < endOfToday.getTime();
  });
}
