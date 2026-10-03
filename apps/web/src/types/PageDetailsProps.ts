import type { BrainPage } from '@orbit/contract'
import type { BrainSearch } from './BrainSearch'

export type PageDetailsProps = {
  readonly page: BrainPage
  readonly search: BrainSearch
}
