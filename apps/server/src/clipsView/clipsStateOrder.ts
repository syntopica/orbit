// Funnel order (spec 7.4); a state clips adds later sorts after these by name.
export const CLIPS_STATE_ORDER: readonly string[] = [
  'pending',
  'needs-claude',
  'synthesized',
  'locally-stale',
  'reconciliation-pending',
  'reconciled',
  'inconsistent',
  'unreadable',
]
