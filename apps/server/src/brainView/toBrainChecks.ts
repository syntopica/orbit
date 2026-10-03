import type { BrainChecks } from '@orbit/contract'

import { toCheckRows } from '../clipsView/toCheckRows'
import type { BrainChecksDocuments } from '../types/BrainChecksDocuments'
import { isIdentifier } from '../workerView/isIdentifier'
import { isPageId } from './isPageId'

// Issue codes and check names are identifiers; a row that fails is dropped.
export const toBrainChecks = (
  { lint, doctor }: BrainChecksDocuments,
  now: number,
): BrainChecks => ({
  now,
  pageCount: lint.pageCount,
  indexStale: lint.indexStale,
  issues: lint.issues
    .filter((issue) => isPageId(issue.page) && isIdentifier(issue.code))
    .slice(0, 500)
    .map(({ page, code }) => ({ page, code })),
  doctor: {
    ok: doctor.ok,
    checks: toCheckRows(doctor).flatMap(({ name, ok, code }) =>
      code === null ? [] : [{ name, ok, code }],
    ),
  },
})
