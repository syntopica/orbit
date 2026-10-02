import type { BucketState } from './BucketState'

export type Bucket = {
  readonly start: number
  readonly end: number
  readonly state: BucketState
}
