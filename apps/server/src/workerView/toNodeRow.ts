import type { WorkerNode } from '@orbit/contract'

import type { WorkerNodeReport } from '../types/WorkerNodeReport'
import { identifierOrNull } from './identifierOrNull'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'
import { toLastRelease } from './toLastRelease'

export const toNodeRow = (
  name: string,
  report: WorkerNodeReport,
): WorkerNode => ({
  name,
  reason: identifierOrNull(report.reason),
  idleMs: report.idle_s == null ? null : secondsToMs(report.idle_s),
  onAc: report.on_ac ?? null,
  pressure: identifierOrNull(report.pressure),
  resident: (report.resident ?? []).filter((model) => isIdentifier(model)),
  reportAgeMs: secondsToMs(report.age_s),
  lastRelease: toLastRelease(report.last_release),
})
