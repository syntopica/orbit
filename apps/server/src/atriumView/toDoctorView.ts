import type { AtriumView } from '@orbit/contract'

import type { AtriumDocuments } from '../types/AtriumDocuments'
import { identifierOrNull } from '../workerView/identifierOrNull'
import { isIdentifier } from '../workerView/isIdentifier'

// Names and codes are identifiers; stale past twice the refresh interval,
// the same policy as refresh.json.
export const toDoctorView = (
  doctor: NonNullable<AtriumDocuments['doctor']>,
  refreshIntervalMs: number,
  now: number,
): NonNullable<AtriumView['doctor']> => {
  const writtenAt = Date.parse(doctor.writtenAt)
  return {
    writtenAt,
    stale: now - writtenAt > 2 * refreshIntervalMs,
    ok: doctor.ok,
    checks: doctor.checks
      .filter((check) => isIdentifier(check.name))
      .map(({ name, ok, severity, code }) => ({
        name,
        ok,
        severity,
        code: identifierOrNull(code),
      })),
  }
}
