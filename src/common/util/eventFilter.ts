import { ScheduleEvent } from '../api';

const DAY_MS = 86_400_000;

// Keep events from local "today 00:00" through `daysAhead` days from `now`.
// Mirrors the popup's need to render already-finished events from earlier
// today, so the lower bound is local midnight rather than `now`.
export function filterUpcomingEvents(
  events: ScheduleEvent[],
  now: number,
  daysAhead: number = 30,
): ScheduleEvent[] {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const horizon = daysAhead * DAY_MS;
  return events.filter(ev => {
    const start = new Date(ev.start.dateTime).getTime();
    return start >= todayStartMs && start - now < horizon;
  });
}

// Parse the ignore-keywords textarea (one keyword per line). Trims, lowercases,
// and discards empty lines so callers can do a plain substring match.
export function parseIgnoreKeywords(raw: string): string[] {
  return raw
    .split('\n')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

// Pick events whose start time is exactly `notifyMinutesBefore` minutes from
// `now`. Comparisons happen on minute granularity to mirror the 1-minute alarm
// tick in background.ts.
export function pickEventsToNotify(
  events: ScheduleEvent[] | undefined,
  now: number,
  notifyMinutesBefore: number,
  ignoreKeywords: string[],
): ScheduleEvent[] {
  if (!events) return [];
  const curMin = Math.round(now / 60_000);
  return events.filter(ev => {
    const subject = ev.subject.toLowerCase();
    if (ignoreKeywords.some(s => subject.includes(s))) return false;
    const startMin = Math.floor(new Date(ev.start.dateTime).getTime() / 60_000);
    return curMin + notifyMinutesBefore === startMin;
  });
}
