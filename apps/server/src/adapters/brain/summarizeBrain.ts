import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { brainHealth } from './brainHealth'
import type { brainLintSchema } from './brainLintSchema'

// Counts only: issue page ids are content and never leave the adapter.
export const summarizeBrain = (
  lint: z.infer<typeof brainLintSchema>,
  doctor: z.infer<typeof doctorDocumentSchema>,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const issues = lint.issues.length
  const failing = doctor.checks.filter((check) => !check.ok).length
  return {
    health: brainHealth(doctor.ok, lint.indexStale),
    metrics: [
      { key: 'brain.pages', value: lint.pageCount, at },
      { key: 'brain.lint_issues', value: issues, at },
      { key: 'brain.doctor_failing', value: failing, at },
    ],
    pending:
      issues > 0
        ? [{ key: 'brain.lint_issues', count: issues, oldestAt: null }]
        : [],
  }
}
