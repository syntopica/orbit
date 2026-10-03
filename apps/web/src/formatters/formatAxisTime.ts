import { formatHourMinute } from './formatHourMinute'

// Hourly axes name the clock, coarser ones the weekday.
export const formatAxisTime = (ms: number, bucketMs: number): string =>
  bucketMs < 21_600_000
    ? formatHourMinute(ms)
    : new Date(ms).toLocaleDateString('en-GB', { weekday: 'short' })
