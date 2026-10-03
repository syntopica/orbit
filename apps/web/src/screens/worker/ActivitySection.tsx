import { WORKER_RANGE_OPTIONS } from '../../charts/workerRangeOptions'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { ActivitySectionProps } from '../../types/ActivitySectionProps'
import { RangePicker } from '../system/RangePicker'
import { ActivityPanel } from './ActivityPanel'

// The range row sits above every chart on the screen and scopes them all.
export const ActivitySection = ({ activity }: ActivitySectionProps) => (
  <section aria-labelledby="activity-heading" className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2
        id="activity-heading"
        className="text-muted text-sm font-semibold uppercase"
      >
        {ACTIVITY_LABELS.heading}
      </h2>
      <RangePicker
        options={WORKER_RANGE_OPTIONS}
        range={activity.range}
        onChange={activity.setRange}
      />
    </div>
    {activity.failed ? (
      <p className="text-muted text-sm">{ACTIVITY_LABELS.unavailable}</p>
    ) : null}
    {activity.model === null && !activity.failed && (
      <p className="text-muted text-sm">{ACTIVITY_LABELS.loading}</p>
    )}
    {activity.model !== null && (
      <ActivityPanel model={activity.model} stale={activity.stale} />
    )}
  </section>
)
