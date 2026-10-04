import type { BucketState } from '../types/BucketState'

// Legend order: outcomes first, then the absence of a run or of data.
export const BUCKET_LEGEND_ORDER: readonly BucketState[] = [
  'ok',
  'failed',
  'missed',
  'idle',
  'unknown',
]
