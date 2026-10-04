import type { WorkerJobDetail } from '@orbit/contract'

export const AttemptWaterfallRow = ({
  attempt,
  first,
  last,
  span,
}: {
  attempt: WorkerJobDetail['attemptDetails'][number]
  first: number
  last: number
  span: number
}) => {
  const left = ((attempt.startedAt - first) / span) * 100
  const width = Math.max(
    2,
    (((attempt.endedAt ?? last) - attempt.startedAt) / span) * 100,
  )
  return (
    <li className="border-line bg-panel rounded-xl border p-3 text-sm">
      <div className="flex flex-wrap gap-x-3">
        <strong>Attempt</strong>
        <span>{attempt.node ?? 'no node'}</span>
        <span>{attempt.provider ?? 'no provider'}</span>
        <span>{attempt.model ?? 'no model'}</span>
        <span>{attempt.outcome ?? 'pending'}</span>
        <span>{attempt.error ?? ''}</span>
      </div>
      <div
        role="img"
        aria-label={`${attempt.outcome ?? 'pending'} from ${new Date(attempt.startedAt).toLocaleString()} to ${attempt.endedAt === null ? 'now' : new Date(attempt.endedAt).toLocaleString()}`}
        className="bg-space relative mt-2 h-3 rounded"
      >
        <div
          className={
            attempt.outcome === 'succeeded'
              ? 'bg-ok absolute h-3 rounded'
              : 'bg-warn absolute h-3 rounded'
          }
          style={{
            left: `${String(left)}%`,
            width: `${String(Math.min(width, 100 - left))}%`,
          }}
        />
      </div>
      <p className="text-muted mt-1">
        {attempt.tokensIn} in · {attempt.tokensOut} out
      </p>
    </li>
  )
}
