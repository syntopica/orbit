import { DEPTH_KEYS } from '../charts/depthKeys'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainSearchPatch } from '../types/BrainSearchPatch'
import { readGraphDepth } from '../validators/readGraphDepth'
import { stepDepth } from './stepDepth'

// Number keys pick a view, + and - widen or narrow it, and Esc steps back:
// from a local view to the overview, then closes an opened community.
export const graphKeyPatch = (
  key: string,
  search: BrainSearch,
): BrainSearchPatch | null => {
  if (DEPTH_KEYS.has(key)) return { depth: readGraphDepth(Number(key)) }
  if (key === '+' || key === '=') return { depth: stepDepth(search.depth, 1) }
  if (key === '-' || key === '_') return { depth: stepDepth(search.depth, -1) }
  if (key !== 'Escape') return null
  if (search.depth !== 0) return { depth: 0 }
  return search.cluster === null ? null : { cluster: null }
}
