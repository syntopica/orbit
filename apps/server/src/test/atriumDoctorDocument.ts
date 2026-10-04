import type { AtriumDocuments } from '../types/AtriumDocuments'

// A doctor.json with one healthy, one drifting and one broken check.
export const atriumDoctorDocument = (
  overrides: Partial<NonNullable<AtriumDocuments['doctor']>> = {},
): NonNullable<AtriumDocuments['doctor']> => ({
  schemaVersion: 1,
  ok: false,
  writtenAt: '2026-10-03T11:30:00Z',
  checks: [
    { name: 'archive', ok: true, severity: 'ok', code: 'archive_fresh' },
    { name: 'synthesis', ok: false, severity: 'warn', code: 'orphans' },
    { name: 'refresh', ok: false, severity: 'broken', code: 'refresh_stale' },
  ],
  ...overrides,
})
