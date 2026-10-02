import type { BucketState } from '../types/BucketState'

export const BUCKET_LABELS: Record<BucketState, string> = {
  unknown: 'not observed',
  failed: 'failed',
  ok: 'ran',
  missed: 'missed',
  idle: 'idle',
}
