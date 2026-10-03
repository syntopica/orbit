import type { FlowStageSpec } from '../types/FlowStageSpec'

export const resolvePolicyMs = (
  spec: FlowStageSpec,
  refreshIntervalMs: number | null,
): number | null => {
  if (spec.policyMs !== 'refresh2x') return spec.policyMs
  return refreshIntervalMs === null ? null : 2 * refreshIntervalMs
}
