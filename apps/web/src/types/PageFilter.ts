import type { BrainSearch } from './BrainSearch'

// The filters that remove pages before a view is built.
export type PageFilter = Pick<BrainSearch, 'hide' | 'hideOrphans' | 'maxLinks'>
