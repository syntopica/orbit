import type { DatabaseSync } from 'node:sqlite'

import { hashSecret } from './hashSecret'

export const markStepUp = (
  db: DatabaseSync,
  session: string,
  now: number,
): boolean =>
  Number(
    db
      .prepare(
        'UPDATE sessions SET step_up_at = ? WHERE hash = ? AND expires > ?',
      )
      .run(now, hashSecret(session), now).changes,
  ) > 0
