import type { PendingView } from '@orbit/contract'

import { PENDING_STATES } from '../labels/pendingStates'

// "2 blocked · 5 open", in triage order, states with no items left out.
export const formatStateCounts = (items: PendingView['items']): string =>
  PENDING_STATES.map((state) => ({
    state,
    count: items.filter((item) => item.state === state).length,
  }))
    .filter(({ count }) => count > 0)
    .map(({ state, count }) => `${String(count)} ${state}`)
    .join(' · ')
