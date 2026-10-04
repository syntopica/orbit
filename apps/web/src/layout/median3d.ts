import { percentile3d } from './percentile3d'

// The middle value, or 0 for none.
export const median3d = (values: readonly number[]): number =>
  percentile3d(values, 0.5)
