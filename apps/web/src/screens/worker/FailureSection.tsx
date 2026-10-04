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
            className="grid grid-cols-[5rem_minmax(0,1fr)_auto] gap-x-3 px-3 py-2 md:col-span-full md:grid-cols-subgrid md:gap-x-4"
          >
            <span className="text-muted">
              {latest.finishedAt === null
                ? '—'
                : formatLocalTime(latest.finishedAt)}
            </span>
            <code className="truncate font-mono">{latest.queue}</code>
            <code className="text-warn col-start-2 row-start-2 font-mono md:col-start-auto md:row-start-auto">
              {latest.error ?? WORKER_LABELS.noError}
            </code>
            <span className="text-muted col-start-3 row-start-1 text-right font-mono md:col-start-auto md:row-start-auto md:text-left">
              {WORKER_LABELS.job} {latest.id.slice(0, 8)}
            </span>
            {count > 1 && (
              <span className="text-muted col-start-3 row-start-2 text-right md:col-start-auto md:row-start-auto md:text-left">
                ×{count}
              </span>
            )}
          </li>
        ))}
      </ol>
    )}
  </section>
)
