import type { ComponentId, Metric } from '@orbit/contract'

export const HEADLINE_METRICS: Partial<Record<ComponentId, Metric['key']>> = {
  launchd: 'launchd.failing',
  worker: 'worker.live',
  synthetic: 'synthetic.value',
}
