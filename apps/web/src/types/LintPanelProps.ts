import type { BrainChecks } from '@orbit/contract'

import type { BrainSearch } from './BrainSearch'

export type LintPanelProps = {
  readonly checks: BrainChecks
  readonly search: BrainSearch
  readonly checkedAt: number | null
}
