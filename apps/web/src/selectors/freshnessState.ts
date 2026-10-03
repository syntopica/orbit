import type { FlowStageState } from '@orbit/contract'

// Spec 7 item 3: ok within policy, warn past it, down past twice.
export const freshnessState = (
  at: number | null,
  policyMs: number,
  now: number,
): FlowStageState => {
  if (at === null) return 'unknown'
  const age = now - at
  if (age <= policyMs) return 'ok'
  return age <= 2 * policyMs ? 'warn' : 'down'
}
