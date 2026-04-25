import { ErrorResponse } from './ErrorResponse';
import { Method, ScheduleEvent } from './type';

// Build the rangeStart query parameter for /schedule/events: midnight local-time
// of the same date one month before `today`, formatted as ISO-8601 with the
// local UTC offset. JS Date normalises a negative month, so January rolls back
// to the previous December automatically.
export function buildScheduleEventsRangeStart(
  today: Date = new Date(),
): string {
  const d = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate(),
  );
  const offset = -d.getTimezoneOffset();

  return (
    d.getFullYear() +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + d.getDate()).slice(-2) +
    'T' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2) +
    ':' +
    ('0' + d.getSeconds()).slice(-2) +
    (offset < 0 ? '-' : '+') +
    ('0' + Math.floor(Math.abs(offset) / 60)).slice(-2) +
    ':' +
    ('0' + (Math.abs(offset) % 60)).slice(-2)
  );
}

/**
 * Garoon API request client.
 *
 * @see https://developer.cybozu.io/hc/ja/articles/360000577946
 */
export class GaroonAPI {
  constructor(protected baseURL: string) {}

  protected async call<T>(method: Method, url: string): Promise<T> {
    const resp = await fetch(`${this.baseURL}/api/v1/${url}`, {
      method,
      headers: {
        'X-Requested-With': 'XMLHTTPRequest',
      },
      redirect: 'error',
    });

    if (resp.status !== 200) {
      throw new ErrorResponse(resp);
    }

    return resp.json();
  }

  async get<T>(url: string) {
    return this.call<T>('GET', url);
  }

  // see, https://developer.cybozu.io/hc/ja/articles/360000440583
  async getScheduleEvents() {
    const start = buildScheduleEventsRangeStart();
    return this.get<{
      hasNext: boolean;
      events: ScheduleEvent[];
    }>(
      'schedule/events?limit=1000&orderBy=start%20asc&rangeStart=' +
        encodeURIComponent(start),
    );
  }
}
