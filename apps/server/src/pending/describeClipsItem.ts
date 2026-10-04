import type { ClipsItem } from '@orbit/contract'

// The detail of a clip row, from codes and counts only: what stage it is in,
// how often it was tried, and what its last run did and cost.
export const describeClipsItem = (item: ClipsItem): string => {
  const lines = [
    `Stage: ${item.stage}`,
    `Reason: ${item.reason}`,
    `Attempts: ${String(item.attempts)}`,
  ]
  if (item.failure !== null)
    lines.push(`Failure: ${item.failure.code} at ${item.failure.stage}`)
  const run = item.lastRun
  if (run !== null) {
    lines.push(
      `Last run: ${run.outcome} in ${String(Math.round(run.durationMs / 1000))} s by ${run.model}`,
    )
    if (run.usage !== null)
      lines.push(
        `Tokens: ${String(run.usage.inputTokens)} in, ${String(run.usage.outputTokens)} out`,
      )
    if (run.workerJobIds.length > 0)
      lines.push(`Worker jobs: ${run.workerJobIds.join(', ')}`)
  }
  return lines.join('\n')
}
