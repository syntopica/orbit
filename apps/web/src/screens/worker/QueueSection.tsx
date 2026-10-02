import { WORKER_LABELS } from '../../labels/workerLabels'
import type { QueueSectionProps } from '../../types/QueueSectionProps'
import { QueueTable } from './QueueTable'

export const QueueSection = ({ active, idle, isPhone }: QueueSectionProps) => (
  <section aria-labelledby="queues-heading" className="space-y-2">
    <h2
      id="queues-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      {WORKER_LABELS.queues}
    </h2>
    {active.length > 0 && <QueueTable rows={active} isPhone={isPhone} />}
    {idle.length > 0 && (
      <details className="border-line bg-panel rounded-xl border">
        <summary className="text-muted cursor-pointer px-3 py-2 text-sm">
          {idle.length} {WORKER_LABELS.idleQueues}
        </summary>
        <QueueTable rows={idle} isPhone={isPhone} />
      </details>
    )}
  </section>
)
