import type { OrbitEvent } from '@orbit/contract'

import type { TickerRow } from '../types/TickerRow'
import { ranBetween } from './ranBetween'

// Events arrive newest first: a stop directly followed by the start of the
// same label within five minutes becomes one "ran" row.
export const collapseTicker = (events: readonly OrbitEvent[]): TickerRow[] => {
  const rows: TickerRow[] = []
  let folded = false
  events.forEach((event, index) => {
    if (folded) {
      folded = false
      return
    }
    const ranMs = ranBetween(event, events[index + 1])
    rows.push({ event, ranMs })
    folded = ranMs !== null
  })
  return rows
}
