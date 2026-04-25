import { ScheduleEvent } from '../../src/common/api';

export interface BuildEventInput {
  id?: string;
  subject?: string;
  start: Date | string;
  end?: Date | string;
  isAllDay?: boolean;
  eventMenu?: string;
  notes?: string;
}

// Minimal ScheduleEvent factory for tests. The cast is intentional: the real
// shape has dozens of fields (creator, watchers, repeatInfo, ...) that the
// production code under test never reads, so synthesising them all per test
// would just be noise. If a test ever exercises one of those fields, extend
// this builder rather than reaching into the cast at the call site.
export function buildEvent(input: BuildEventInput): ScheduleEvent {
  const start = typeof input.start === 'string' ? input.start : input.start.toISOString();
  const end =
    input.end == null
      ? start
      : typeof input.end === 'string'
        ? input.end
        : input.end.toISOString();

  return {
    id: input.id ?? 'evt-' + start,
    subject: input.subject ?? 'test event',
    eventMenu: input.eventMenu ?? '',
    notes: input.notes ?? '',
    isAllDay: input.isAllDay ?? false,
    start: { dateTime: start, timeZone: 'Asia/Tokyo' },
    end: { dateTime: end, timeZone: 'Asia/Tokyo' },
  } as unknown as ScheduleEvent;
}
