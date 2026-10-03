import { pageIdSchema } from '@orbit/contract'

import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

// A listed argument matches itself; the placeholder matches a valid page id.
export const argMatches = (listed: string, requested: string): boolean =>
  listed === PAGE_ID_PLACEHOLDER
    ? pageIdSchema.safeParse(requested).success
    : listed === requested
