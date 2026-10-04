import type { GraphModel } from '../types/GraphModel'

// The page with the most links, the earliest on a tie; null when empty.
export const mostCentralPage = (model: GraphModel): number | null => {
  let best: number | null = null
  model.degree.forEach((degree, index) => {
    if (best === null || degree > (model.degree[best] ?? 0)) best = index
  })
  return best
}
