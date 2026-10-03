import type { GraphDepth } from '../types/GraphDepth'

export const readGraphDepth = (value: unknown): GraphDepth =>
  value === 1 || value === 2 || value === 3 ? value : 0
