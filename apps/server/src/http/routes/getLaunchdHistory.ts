import type { Handler } from 'hono'
import type { DatabaseSync } from 'node:sqlite'

import { readLaunchdHistory } from '../../history/readLaunchdHistory'
import type { DetailPool } from '../../types/DetailPool'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { HISTORY_LOOKBACK_MS } from './historyLookbackMs'
import { HISTORY_RANGE_SPANS } from './historyRangeSpans'
import { readCatalogRows } from './readCatalogRows'

export const getLaunchdHistory =
  (
    historyDb: DatabaseSync,
    catalog: LaunchdCatalog | null,
    pool: DetailPool,
    now: () => number,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    const span = HISTORY_RANGE_SPANS.get(c.req.query('range') ?? '')
    if (span === undefined) return c.json({ error: 'bad_request' }, 400)
    const label = c.req.query('label')
    const rows =
      catalog === null
        ? []
        : await readCatalogRows(catalog, pool).catch(() => [])
    if (label === undefined || !rows.some((row) => row.label === label)) {
      return c.json({ error: 'not_found' }, 404)
    }
    return c.json(
      readLaunchdHistory(historyDb, label, now() - span - HISTORY_LOOKBACK_MS),
    )
  }
