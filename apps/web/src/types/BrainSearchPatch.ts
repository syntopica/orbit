import type { BrainSearch } from './BrainSearch'

export type BrainSearchPatch = Partial<Omit<BrainSearch, 'page'>>
