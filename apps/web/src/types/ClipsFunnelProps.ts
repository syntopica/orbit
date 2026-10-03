import type { ClipsView } from '@orbit/contract'

import type { FunnelRow } from './FunnelRow'

export type ClipsFunnelProps = {
  readonly rows: readonly FunnelRow[]
  readonly capture: ClipsView['capture']
  readonly now: number
}
