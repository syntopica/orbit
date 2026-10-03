import type { BrainSearch } from './BrainSearch'

export type PagePanelProps = {
  readonly id: string
  readonly search: BrainSearch
  readonly select: (id: string | null) => void
}
