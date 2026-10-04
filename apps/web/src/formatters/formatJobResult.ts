import type { WorkerJob } from '@orbit/contract'

// What the newest attempt came to: its error code when it failed, else its
// outcome; a job no attempt has settled yet shows a dash.
export const formatJobResult = (
  job: Pick<WorkerJob, 'lastError' | 'lastOutcome'>,
): string => job.lastError ?? job.lastOutcome ?? '—'
