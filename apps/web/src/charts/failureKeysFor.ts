import { FAILURE_CODE_ORDER } from './failureCodeOrder'
import { FAILURE_KEYS } from './failureKeys'

// Each code to its fixed slot; "other" and anything unlisted is neutral grey.
export const failureKeysFor = (
  keys: readonly string[],
): Record<string, string> =>
  Object.fromEntries(
    keys.map((key) => [
      key,
      FAILURE_KEYS[FAILURE_CODE_ORDER.indexOf(key)] ?? 'bg-unknown',
    ]),
  )
