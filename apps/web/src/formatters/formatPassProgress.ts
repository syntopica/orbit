import type { AtriumPasses } from '@orbit/contract'

import { formatCount } from './formatCount'
import { formatDuration } from './formatDuration'

// "running 26m · 1 of 52,427 conversations · 0 synthesized · 4 failed"
export const formatPassProgress = (passes: AtriumPasses): string | null => {
  const { lastPass, progress, now } = passes
  if (lastPass?.state !== 'running') return null
  const parts = [
    lastPass.startedAt === null
      ? 'running'
      : `running ${formatDuration(now - lastPass.startedAt)}`,
  ]
  if (progress !== null)
    parts.push(
      `${formatCount(progress.finished)} of ${formatCount(progress.conversations)} conversations`,
      `${formatCount(progress.synthesized)} synthesized`,
      `${formatCount(progress.failed)} failed`,
    )
  return parts.join(' · ')
}
