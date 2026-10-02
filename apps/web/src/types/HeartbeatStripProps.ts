import type { Bucket } from './Bucket'

export type HeartbeatStripProps = {
  readonly buckets: readonly Bucket[]
  readonly summary: string
}
