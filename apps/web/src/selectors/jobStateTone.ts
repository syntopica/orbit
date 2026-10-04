import type { FlowStageState } from '@orbit/contract'

// The status colour of a worker job state; unknown states stay neutral.
export const jobStateTone = (state: string): FlowStageState => {
  if (state === 'succeeded') return 'ok'
  if (state === 'failed' || state === 'expired') return 'down'
  if (state === 'running' || state === 'leased') return 'warn'
  return 'unknown'
}
