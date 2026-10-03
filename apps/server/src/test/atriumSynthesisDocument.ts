import type { AtriumDocuments } from '../types/AtriumDocuments'

export const atriumSynthesisDocument = (
  lastPass: Partial<NonNullable<AtriumDocuments['synthesis']>['lastPass']> = {},
): NonNullable<AtriumDocuments['synthesis']> => ({
  schemaVersion: 1,
  writtenAt: '2026-10-03T11:00:00.000Z',
  lastPass: {
    producer: 'task',
    startedAt: '2026-10-03T10:40:00.000Z',
    finishedAt: '2026-10-03T11:00:00.000Z',
    conversations: 12,
    synthesized: 6,
    skipped: 1,
    failed: 1,
    deferred: 4,
    ...lastPass,
  },
})
