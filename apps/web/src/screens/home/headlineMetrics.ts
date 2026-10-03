import type { ComponentId, Metric } from '@orbit/contract'

export const HEADLINE_METRICS: Partial<Record<ComponentId, Metric['key']>> = {
  launchd: 'launchd.failing',
  worker: 'worker.live',
  atrium: 'atrium.not_indexed',
  brain: 'brain.lint_issues',
  clips: 'clips.pending',
  capture: 'capture.undrained',
  synthetic: 'synthetic.value',
}
