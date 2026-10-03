import type { OrbitEvent } from '@orbit/contract'

export type TickerRow = {
  // Stream id of the row's newest event; unique within the ticker.
  readonly id: number
  readonly event: OrbitEvent
  // Set when a start and its stop were folded into one row.
  readonly ranMs: number | null
}
