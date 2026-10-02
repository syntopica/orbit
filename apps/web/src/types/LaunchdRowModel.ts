import type { Bucket } from './Bucket'

export type LaunchdRowModel = {
  readonly buckets: readonly Bucket[] | null
  readonly state: string
  readonly summary: string
}
