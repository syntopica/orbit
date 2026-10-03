import type { FlowStageState } from '@orbit/contract'

// Status colours, reserved for state and always shown with a label.
export const STATE_DOTS: Record<FlowStageState, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  down: 'bg-down',
  unknown: 'bg-unknown',
}
