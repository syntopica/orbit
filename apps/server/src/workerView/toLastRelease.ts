import type { WorkerNode } from '@orbit/contract'

import type { WorkerNodeReport } from '../types/WorkerNodeReport'
import { identifierOrNull } from './identifierOrNull'
import { secondsToMs } from './secondsToMs'

export const toLastRelease = (
  release: WorkerNodeReport['last_release'],
): WorkerNode['lastRelease'] =>
  release == null
    ? null
    : {
        code: identifierOrNull(release.code),
        ageMs: secondsToMs(release.age_s),
      }
