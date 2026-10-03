import { FAILURE_CODE_ORDER } from './failureCodeOrder'
import { FAILURE_FILLS } from './failureFills'

// Each code to its fixed slot; "other" and anything unlisted is neutral grey.
export const failureFillsFor = (
  keys: readonly string[],
): Record<string, string> =>
  Object.fromEntries(
    keys.map((key) => [
      key,
      FAILURE_FILLS[FAILURE_CODE_ORDER.indexOf(key)] ?? 'fill-unknown',
    ]),
  )
