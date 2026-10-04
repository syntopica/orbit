import { formatClock } from './formatClock'

// When a result was read, for a panel whose all-clear would otherwise say
// nothing about how current it is.
export const formatCheckedAt = (ms: number): string =>
  `Checked at ${formatClock(new Date(ms).toISOString())}.`
