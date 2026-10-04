import { identifierSchema } from '@orbit/contract'
import { pendingStateSchema } from './pendingStateSchema'

export const validatePendingSearch = (search: Record<string, unknown>) => {
  const state = pendingStateSchema.safeParse(search['state'])
  return {
    ...(state.success ? { state: state.data } : {}),
    ...(typeof search['source'] === 'string' &&
    identifierSchema.safeParse(search['source']).success
      ? { source: search['source'] }
      : {}),
    ...(typeof search['q'] === 'string' &&
    search['q'].length <= 500 &&
    search['q'].trim() !== ''
      ? { q: search['q'] }
      : {}),
  }
}
