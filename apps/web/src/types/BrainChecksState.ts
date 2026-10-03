import type { BrainChecks } from '@orbit/contract'

export type BrainChecksState = {
  readonly checks: BrainChecks | null
  readonly failed: boolean
}
