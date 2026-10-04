import type { WorkerJobDetail } from '@orbit/contract'

import { AttemptWaterfallRow } from './AttemptWaterfallRow'

export const AttemptWaterfall = ({
  attempts,
}: {
  attempts: WorkerJobDetail['attemptDetails']
}) => {
  const first = Math.min(...attempts.map((attempt) => attempt.startedAt))
  const last = Math.max(
    ...attempts.map((attempt) => attempt.endedAt ?? attempt.startedAt),
  )
  const span = Math.max(1, last - first)
  return (
    <section aria-label="Attempts" className="space-y-3">
      <h2 className="text-lg font-semibold">Attempts</h2>
      {attempts.length === 0 ? <p>No attempts yet.</p> : null}
      <ol className="space-y-3">
        {attempts.map((attempt) => (
          <AttemptWaterfallRow
            key={JSON.stringify(attempt)}
            attempt={attempt}
            first={first}
            last={last}
            span={span}
          />
        ))}
      </ol>
    </section>
  )
}
