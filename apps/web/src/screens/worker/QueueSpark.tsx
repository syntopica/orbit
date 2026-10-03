import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { QueueSparkProps } from '../../types/QueueSparkProps'
import { Sparkline } from './Sparkline'

// Succeeded production attempts per bucket; a queue with none is a flat line.
export const QueueSpark = ({ name, model, stale }: QueueSparkProps) =>
  model === null ? null : (
    <div
      data-stale={stale}
      className="transition-opacity data-[stale=true]:opacity-50"
    >
      <Sparkline
        starts={model.starts}
        values={model.queues.get(name)?.succeeded ?? model.starts.map(() => 0)}
        bucketMs={model.bucketMs}
        label={`${name}: ${ACTIVITY_LABELS.sparkline}`}
        unit={ACTIVITY_LABELS.succeeded}
        stroke="stroke-accent"
        dot="fill-accent"
      />
    </div>
  )
