import { readClusterId } from '../graph/readClusterId'
import type { BrainSearch } from '../types/BrainSearch'
import { withPage } from './withPage'

// A cluster opens in place; a page becomes the focus of a local view, so a
// page picked from the overview, the list or a search shows its
// neighbourhood; the empty stage clears the page and closes a cluster.
export const searchForNode = (
  search: BrainSearch,
  id: string | null,
): BrainSearch => {
  if (id === null)
    return search.depth === 0
      ? { ...withPage(search, null), cluster: null }
      : withPage(search, null)
  const cluster = readClusterId(id)
  if (cluster !== null) return { ...search, cluster }
  return {
    ...withPage(search, id),
    depth: search.depth === 0 ? 1 : search.depth,
  }
}
