import type { Handler } from 'hono'

import type { DetailPool } from '../../types/DetailPool'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'
import type { OrbitEnv } from '../../types/OrbitEnv'
import { readCatalogRows } from './readCatalogRows'

export const getLaunchdRows =
  (
    catalog: LaunchdCatalog | null,
    pool: DetailPool,
  ): Handler<OrbitEnv, string> =>
  async (c) => {
    if (catalog === null) return c.json({ rows: [] })
    const rows = await readCatalogRows(catalog, pool).catch(() => null)
    return rows === null
      ? c.json({ error: 'unavailable' }, 503)
      : c.json({ rows })
  }
