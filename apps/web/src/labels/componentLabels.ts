import type { ComponentId } from '@orbit/contract'

export const COMPONENT_LABELS: Record<ComponentId, string> = {
  launchd: 'Scheduled jobs',
  worker: 'Worker',
  atrium: 'Atrium',
  brain: 'Brain',
  clips: 'Clips',
  capture: 'Capture',
  pending: 'Pending',
  synthetic: 'Synthetic probe',
}
