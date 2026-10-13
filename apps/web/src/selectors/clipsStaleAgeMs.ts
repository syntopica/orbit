import type { ClipsView } from '@orbit/contract'
import type { ClipsQueryState } from '../types/ClipsQueryState'

// How old the shown clips data is when it is not fresh: since the last
// successful fetch after a failed refetch, or since the server's last good
// read when the server itself fell back to one; otherwise null.
export const clipsStaleAgeMs = (
  view: ClipsView | null,
  query: ClipsQueryState,
): number | null => {
  if (view === null) return null
  if (query.isError) return query.errorUpdatedAt - query.dataUpdatedAt
  return view.lastGoodAt === undefined ? null : view.now - view.lastGoodAt
}
