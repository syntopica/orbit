import { formatLocalTime } from '../../formatters/formatLocalTime'
import { WORKER_LABELS } from '../../labels/workerLabels'
import type { FailureSectionProps } from '../../types/FailureSectionProps'
import { FailureChart } from './FailureChart'

export const FailureSection = ({ groups, activity }: FailureSectionProps) => (
  <section aria-labelledby="failures-heading" className="space-y-2">
    <h2
      id="failures-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      {WORKER_LABELS.failures}
    </h2>
    {activity.model !== null && activity.model.failures.keys.length > 0 && (
      <FailureChart
        failures={activity.model.failures}
        bucketMs={activity.model.bucketMs}
        stale={activity.stale}
      />
    )}
    {groups.length === 0 ? (
      <p className="text-muted text-sm">{WORKER_LABELS.noFailures}</p>
    ) : (
      <ol
        aria-label={WORKER_LABELS.failedJobs}
        className="divide-line border-line bg-panel divide-y rounded-xl border text-sm md:grid md:grid-cols-[max-content_minmax(0,max-content)_minmax(0,max-content)_max-content_1fr]"
      >
        {groups.map(({ latest, count }) => (
          <li
            key={latest.id}
            className="flex flex-wrap gap-x-4 px-3 py-2 md:col-span-full md:grid md:grid-cols-subgrid"
          >
            <span className="text-muted">
              {latest.finishedAt === null
                ? '—'
                : formatLocalTime(latest.finishedAt)}
            </span>
            <code className="font-mono">{latest.queue}</code>
            <code className="text-warn font-mono">
              {latest.error ?? WORKER_LABELS.noError}
            </code>
            <span className="text-muted font-mono">
              {WORKER_LABELS.job} {latest.id.slice(0, 8)}
            </span>
            {count > 1 && <span className="text-muted">×{count}</span>}
          </li>
        ))}
      </ol>
    )}
  </section>
)
