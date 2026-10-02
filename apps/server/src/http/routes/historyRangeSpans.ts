// The only ranges the history route accepts, in milliseconds.
export const HISTORY_RANGE_SPANS: ReadonlyMap<string, number> = new Map([
  ['24h', 86_400_000],
  ['7d', 7 * 86_400_000],
  ['30d', 30 * 86_400_000],
])
