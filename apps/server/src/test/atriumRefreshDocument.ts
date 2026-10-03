import type { AtriumDocuments } from '../types/AtriumDocuments'

// A full refresh.json with placeholder sources and models.
export const atriumRefreshDocument = (
  overrides: Partial<AtriumDocuments['refresh']> = {},
): AtriumDocuments['refresh'] => ({
  schemaVersion: 1,
  writtenAt: '2026-10-03T11:30:00.000Z',
  records: { total: 50, bySource: { 'source-a': 40, 'source-b': 10 } },
  archive: { at: '2026-10-03T11:00:00.000Z' },
  refresh: { at: '2026-10-03T11:30:00.000Z' },
  content: { at: '2026-10-03T10:00:00.000Z' },
  populations: [
    { model: 'model-a', intended: 10, indexed: 7 },
    { model: 'model-b', intended: 3, indexed: 5 },
  ],
  ...overrides,
})
