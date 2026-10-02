import type { Pending } from '@orbit/contract'

export const PENDING_LABELS: Record<Pending['key'], string> = {
  'launchd.failing_jobs': 'failing jobs',
  'worker.failed_jobs': 'failed jobs',
  'worker.queued_jobs': 'queued jobs',
  'synthetic.items': 'probe items',
}
