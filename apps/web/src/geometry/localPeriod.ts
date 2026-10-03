// Which local-time period (6 h or a day) an instant falls in.
export const localPeriod = (ms: number, periodMs: number): number =>
  Math.floor((ms - new Date(ms).getTimezoneOffset() * 60_000) / periodMs)
