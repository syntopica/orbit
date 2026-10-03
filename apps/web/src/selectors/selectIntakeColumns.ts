import type { ClipsView } from '@orbit/contract'

import type { StackColumn } from '../types/StackColumn'

// clips counts intake per UTC day.
export const selectIntakeColumns = (
  intake: ClipsView['intake'],
): StackColumn[] =>
  intake.days.map(({ day, count }) => {
    const start = Date.parse(`${day}T00:00:00Z`)
    return {
      start,
      end: start + 86_400_000,
      segments: [{ key: 'captured', count }],
      total: count,
    }
  })
