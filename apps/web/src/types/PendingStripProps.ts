import type { PendingRow } from './PendingRow'

export type PendingStripProps = {
  readonly rows: readonly PendingRow[]
  readonly now: number
}
