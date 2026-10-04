import { secondsToMs } from './secondsToMs'

// An optional worker time or duration in seconds, as milliseconds.
export const secondsToMsOrNull = (seconds: number | null): number | null =>
  seconds === null ? null : secondsToMs(seconds)
