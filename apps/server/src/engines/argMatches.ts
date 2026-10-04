import { contextQuerySchema, pageIdSchema } from '@orbit/contract'

import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'
import { QUERY_PLACEHOLDER } from './queryPlaceholder'

// A listed argument matches itself; `{pageId}` matches a valid page id and
// `{query}` a query already in its trimmed, bounded form.
export const argMatches = (listed: string, requested: string): boolean => {
  if (listed === PAGE_ID_PLACEHOLDER)
    return pageIdSchema.safeParse(requested).success
  if (listed === QUERY_PLACEHOLDER)
    return contextQuerySchema.safeParse(requested).data === requested
  return listed === requested
}
