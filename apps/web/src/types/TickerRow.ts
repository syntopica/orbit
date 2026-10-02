import type { OrbitEvent } from '@orbit/contract'

export type TickerRow = {
  readonly event: OrbitEvent
  // Set when a start and its stop were folded into one row.
  readonly ranMs: number | null
}
