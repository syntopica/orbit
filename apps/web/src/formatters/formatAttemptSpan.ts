import { formatClock } from './formatClock'
import { formatDuration } from './formatDuration'

// An attempt's start, end and length as text, beside its bar on the job's
// timeline; an attempt still running has no end yet.
export const formatAttemptSpan = (
  startedAt: number,
  endedAt: number | null,
): string => {
  const start = formatClock(new Date(startedAt).toISOString())
  if (endedAt === null) return `started ${start}, still running`
  const end = formatClock(new Date(endedAt).toISOString())
  return `${start} to ${end} (${formatDuration(endedAt - startedAt)})`
}
