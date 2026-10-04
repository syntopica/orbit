import type { AtriumPass } from '@orbit/contract'

import { ATRIUM_LABELS } from '../labels/atriumLabels'
import { formatDuration } from './formatDuration'

// "local · model-a:7b · exit 124 (time box) · took 55m · 1h ago"
export const formatPassSummary = (pass: AtriumPass, now: number): string =>
  [
    pass.lane,
    pass.model,
    pass.exitCode === null
      ? ATRIUM_LABELS.passStates[pass.state]
      : `exit ${String(pass.exitCode)} (${ATRIUM_LABELS.passStates[pass.state]})`,
    pass.durationMs === null ? null : `took ${formatDuration(pass.durationMs)}`,
    pass.finishedAt === null
      ? null
      : `${formatDuration(now - pass.finishedAt)} ${ATRIUM_LABELS.ago}`,
  ]
    .filter((part) => part !== null)
    .join(' · ')
