import type { Metric } from '@orbit/contract'

export const METRIC_LABELS: Record<Metric['key'], string> = {
  'launchd.jobs': 'jobs',
  'launchd.running': 'running',
  'launchd.failing': 'failing',
  'worker.queued': 'queued',
  'worker.live': 'running',
  'worker.failed': 'failed',
  'worker.done_1h': 'done in the last hour',
  'worker.wasted_1h_s': 'wasted in the last hour',
  'worker.cooldowns': 'cooling down',
  'worker.nodes': 'nodes',
  'synthetic.value': 'value',
}
