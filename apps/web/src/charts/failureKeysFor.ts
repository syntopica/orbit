import { FAILURE_KEYS } from './failureKeys'

export const failureKeysFor = (
  keys: readonly string[],
): Record<string, string> =>
  Object.fromEntries(
    keys.map((key, i) => [
      key,
      key === 'other' ? 'bg-unknown' : (FAILURE_KEYS[i] ?? 'bg-unknown'),
    ]),
  )
