import type { FlowStageState, Snapshot } from '@orbit/contract'

// Spec 7 item 3: ok within policy, warn past it, down past twice. A down
// component downs its stage; an absent one or a missing instant is unknown.
export const stageState = (
  snapshot: Snapshot | undefined,
  freshAt: number | null,
  policyMs: number | null,
  now: number,
): FlowStageState => {
  if (snapshot === undefined) return 'unknown'
  if (snapshot.health.state === 'down') return 'down'
  if (freshAt === null || policyMs === null) return 'unknown'
  const age = now - freshAt
  if (age <= policyMs) return 'ok'
  return age <= 2 * policyMs ? 'warn' : 'down'
}
