import type { DatabaseSync } from 'node:sqlite'

export const measureDbBytes = (db: DatabaseSync): number => {
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)')
  const row = db
    .prepare(
      'SELECT (page_count - freelist_count) * page_size AS bytes FROM pragma_page_count(), pragma_freelist_count(), pragma_page_size()',
    )
    .get() as { bytes: number }
  return row.bytes
}
