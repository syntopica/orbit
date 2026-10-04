import type { GraphDepth } from '../types/GraphDepth'
import { readGraphDepth } from '../validators/readGraphDepth'

// One step wider or narrower, between the overview (0) and three steps.
export const stepDepth = (depth: GraphDepth, delta: number): GraphDepth =>
  readGraphDepth(Math.min(3, Math.max(0, depth + delta)))
