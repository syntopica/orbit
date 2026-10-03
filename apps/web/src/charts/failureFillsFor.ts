import { FAILURE_FILLS } from './failureFills'

// The range's codes by rank to slots 1-4; the folded rest is neutral grey.
export const failureFillsFor = (
  keys: readonly string[],
): Record<string, string> =>
  Object.fromEntries(
    keys.map((key, i) => [
      key,
      key === 'other' ? 'fill-unknown' : (FAILURE_FILLS[i] ?? 'fill-unknown'),
    ]),
  )
