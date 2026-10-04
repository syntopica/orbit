import type { WorkerCooldown, WorkerQuality } from '@orbit/contract'

import type { ExecutorRow } from '../types/ExecutorRow'

export const selectExecutors = (
  view: WorkerQuality,
  cooldowns: readonly WorkerCooldown[],
): ExecutorRow[] => {
  const grouped = new Map<string, WorkerQuality['attempts']>()
  for (const row of view.attempts) {
    const key = `${row.provider}\u0000${row.model}`
    grouped.set(key, [...(grouped.get(key) ?? []), row])
  }
  return [...grouped.values()]
    .map((attempts) => {
      const first = attempts[0]
      if (first === undefined) throw new Error('empty executor group')
      const judged = view.judged.filter(
        (row) => row.provider === first.provider && row.model === first.model,
      )
      const count = judged.reduce((sum, row) => sum + row.judged, 0)
      const scored = judged.filter((row) => row.meanScore !== null)
      const scoredCount = scored.reduce((sum, row) => sum + row.judged, 0)
      return {
        provider: first.provider,
        model: first.model,
        queues: [...new Set(attempts.map((row) => row.queue))].sort(),
        attempts: attempts.reduce((sum, row) => sum + row.attempts, 0),
        succeeded: attempts.reduce((sum, row) => sum + row.succeeded, 0),
        judged: count,
        meanScore:
          scoredCount === 0
            ? null
            : scored.reduce(
                (sum, row) => sum + (row.meanScore ?? 0) * row.judged,
                0,
              ) / scoredCount,
        lowSample: attempts.some(
          (row) =>
            (judged.find((item) => item.queue === row.queue)?.judged ?? 0) < 20,
        ),
        availableAt:
          cooldowns.find((row) => row.runner === first.provider)?.availableAt ??
          null,
      }
    })
    .sort(
      (a, b) => b.attempts - a.attempts || a.provider.localeCompare(b.provider),
    )
}
