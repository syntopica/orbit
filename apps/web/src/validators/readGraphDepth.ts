import type { GraphDepth } from '../types/GraphDepth'

// The local view one step around the focus is the default.
export const readGraphDepth = (value: unknown): GraphDepth =>
  value === 0 || value === 2 || value === 3 ? value : 1
