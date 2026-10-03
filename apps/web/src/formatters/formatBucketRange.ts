import { formatHourMinute } from './formatHourMinute'
import { formatLocalTime } from './formatLocalTime'

// A bucket in the viewer's zone, e.g. "Tue 14:00–15:00".
export const formatBucketRange = (start: number, end: number): string =>
  `${formatLocalTime(start)}–${formatHourMinute(end)}`
