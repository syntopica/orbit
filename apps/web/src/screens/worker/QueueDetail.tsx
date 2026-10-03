import { formatCount } from '../../formatters/formatCount'
import { formatCounts } from '../../formatters/formatCounts'
import { formatDuration } from '../../formatters/formatDuration'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { QueueDetailProps } from '../../types/QueueDetailProps'
import { QueueSparkTable } from './QueueSparkTable'

// One queue's production attempts in the selected range.
export const QueueDetail = ({ id, name, model }: QueueDetailProps) => {
  const activity = model?.queues.get(name)
  return (
    <div
      id={id}
      role="group"
      aria-label={`${name} ${ACTIVITY_LABELS.details}`}
      className="space-y-2 py-2 text-xs"
    >
      {activity === undefined || model === null ? (
        <p className="text-muted">{ACTIVITY_LABELS.noActivity}</p>
      ) : (
        <>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
            <dt className="text-muted">{ACTIVITY_LABELS.outcomes}</dt>
            <dd className="font-mono">{formatCounts(activity.outcomes)}</dd>
            <dt className="text-muted">{ACTIVITY_LABELS.providers}</dt>
            <dd className="font-mono">{formatCounts(activity.providers)}</dd>
            <dt className="text-muted">{ACTIVITY_LABELS.meanHeader}</dt>
            <dd>
              {activity.meanWallMs === null
                ? '—'
                : formatDuration(activity.meanWallMs)}
            </dd>
            <dt className="text-muted">{ACTIVITY_LABELS.tokens}</dt>
            <dd>
              {formatCount(activity.tokensIn)} {ACTIVITY_LABELS.tokensIn} ·{' '}
              {formatCount(activity.tokensOut)} {ACTIVITY_LABELS.tokensOut}
            </dd>
            <dt className="text-muted">{ACTIVITY_LABELS.errors}</dt>
            <dd className="font-mono break-all">
              {formatCounts(activity.errors)}
            </dd>
          </dl>
          <QueueSparkTable model={model} values={activity.succeeded} />
        </>
      )}
    </div>
  )
}
