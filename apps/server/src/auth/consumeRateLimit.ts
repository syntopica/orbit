import type { DatabaseSync } from 'node:sqlite'

import type { RateRule } from '../types/RateRule'

export const consumeRateLimit = (
  db: DatabaseSync,
  rule: RateRule,
  now: number,
): boolean => {
  const window = Math.floor(now / 60_000)
  const row = db
    .prepare(
      'INSERT INTO rate_limits (key, window, count) VALUES (?, ?, 1) ON CONFLICT(key, window) DO UPDATE SET count = count + 1 RETURNING count',
    )
    .get(rule.key, window) as { count: number }
  db.prepare('DELETE FROM rate_limits WHERE window < ?').run(window - 1)
  return row.count <= rule.limit
}
