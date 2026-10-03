import type { BrainPage } from '@orbit/contract'

export type BrainPageState = {
  readonly page: BrainPage | null
  readonly loading: boolean
  readonly missing: boolean
  readonly failed: boolean
}
