import type { FunnelGroupSpec } from '../types/FunnelGroupSpec'

// D8: clips' derived states in the order a clip moves through them.
export const FUNNEL_GROUPS: readonly FunnelGroupSpec[] = [
  { id: 'pending', states: ['pending'] },
  { id: 'review', states: ['needs-claude'] },
  {
    id: 'reconciling',
    states: ['synthesized', 'locally-stale', 'reconciliation-pending'],
  },
  { id: 'reconciled', states: ['reconciled'] },
  { id: 'broken', states: ['inconsistent', 'unreadable'] },
]
