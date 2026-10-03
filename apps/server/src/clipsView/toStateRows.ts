import type { ClipsView } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { ClipsDocuments } from '../types/ClipsDocuments'
import { isIdentifier } from '../workerView/isIdentifier'
import { clipsStateRank } from './clipsStateRank'

export const toStateRows = (
  status: ClipsDocuments['status'],
): ClipsView['states'] => {
  return Object.entries(status.states)
    .filter(([state]) => isIdentifier(state))
    .toSorted(
      ([a], [b]) => clipsStateRank(a) - clipsStateRank(b) || a.localeCompare(b),
    )
    .map(([state, count]) => ({
      state,
      count,
      oldestAt: epochOrNull(status.oldestAt[state]),
    }))
}
