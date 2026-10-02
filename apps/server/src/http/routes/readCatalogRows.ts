import type { DetailPool } from '../../types/DetailPool'
import type { LaunchdCatalog } from '../../types/LaunchdCatalog'

export const readCatalogRows = async (
  catalog: LaunchdCatalog,
  pool: DetailPool,
): ReturnType<LaunchdCatalog['rows']> =>
  pool.run(async (signal) => catalog.rows(signal), 15_000)
