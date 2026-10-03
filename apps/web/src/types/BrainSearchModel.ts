import type { BrainSearch } from './BrainSearch'
import type { BrainSearchPatch } from './BrainSearchPatch'

export type BrainSearchModel = {
  readonly search: BrainSearch
  readonly select: (id: string | null) => void
  readonly update: (patch: BrainSearchPatch) => void
}
