import type { WorkerCooldown } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { isIdentifier } from './isIdentifier'
import { secondsToMs } from './secondsToMs'

// The longest wait first: it is the one that keeps work queued longest.
export const toCooldownRows = (
  cooldowns: WorkerStatus['cooldowns'],
  now: number,
): WorkerCooldown[] =>
  Object.entries(cooldowns)
    .filter(([runner]) => isIdentifier(runner))
    .map(([runner, remainingS]) => ({
      runner,
      availableAt: now + secondsToMs(remainingS),
    }))
    .toSorted(
      (a, b) =>
        b.availableAt - a.availableAt || a.runner.localeCompare(b.runner),
    )
