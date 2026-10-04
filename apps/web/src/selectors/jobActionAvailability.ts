import type { WorkerJobDetail } from '@orbit/contract'

export const jobActionAvailability = (job: WorkerJobDetail) => ({
  cancelable: ![
    'succeeded',
    'failed',
    'expired',
    'cancelled',
    'superseded',
    'reconciled',
    'unacked_expired',
  ].includes(job.state),
  retryable:
    ['failed', 'expired', 'cancelled'].includes(job.state) && job.hasInput,
  ackable:
    [
      'failed',
      'expired',
      'cancelled',
      'split_requested',
      'needs_reconciliation',
      'unacked_expired',
    ].includes(job.state) && job.acked === null,
})
