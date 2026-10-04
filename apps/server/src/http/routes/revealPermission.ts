import type { WorkerJobDetail } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

import { hasRecentStepUp } from '../../auth/hasRecentStepUp'

export const revealPermission = ({
  job,
  header,
  db,
  session,
  now,
}: {
  job: WorkerJobDetail
  header: string | undefined
  db: DatabaseSync
  session: string
  now: number
}): 'reveal_required' | 'step_up_required' | null => {
  const sensitive = ['personal', 'mail', 'secret'].includes(job.privacy)
  if (sensitive && header !== job.privacy) return 'reveal_required'
  if (job.privacy === 'secret' && !hasRecentStepUp(db, session, now))
    return 'step_up_required'
  return null
}
