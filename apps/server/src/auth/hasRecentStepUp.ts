import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'

export const hasRecentStepUp = (
  db: DatabaseSync,
  session: string,
  now: number,
): boolean => {
  const row = db
    .prepare('SELECT step_up_at FROM sessions WHERE hash = ? AND expires > ?')
    .get(hashSecret(session), now) as { step_up_at: number | null } | undefined
  return (
    row?.step_up_at !== null &&
    row?.step_up_at !== undefined &&
    row.step_up_at <= now &&
    now - row.step_up_at < 300_000
  )
}
