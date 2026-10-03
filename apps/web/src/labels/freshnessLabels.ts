import type { FlowStageState } from '@orbit/contract'

export const FRESHNESS_LABELS: Record<FlowStageState, string> = {
  ok: 'Fresh',
  warn: 'Behind',
  down: 'Stalled',
  unknown: 'Not measured',
}
