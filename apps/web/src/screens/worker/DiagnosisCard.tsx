import { WORKER_LABELS } from '../../labels/workerLabels'
import type { DiagnosisCardProps } from '../../types/DiagnosisCardProps'
import { BlockerList } from './BlockerList'

export const DiagnosisCard = ({ diagnosis }: DiagnosisCardProps) => (
  <section
    aria-labelledby="diagnosis-heading"
    data-state={diagnosis.state}
    className="border-line bg-panel data-[state=blocked]:border-warn space-y-2 rounded-xl border p-4"
  >
    <h2
      id="diagnosis-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      {WORKER_LABELS.diagnosis}
    </h2>
    {diagnosis.state === 'idle' && <p>{WORKER_LABELS.nothingWaiting}</p>}
    {diagnosis.state === 'working' && (
      <p>
        {diagnosis.live} {WORKER_LABELS.working} {diagnosis.queued}{' '}
        {WORKER_LABELS.waiting}
      </p>
    )}
    {diagnosis.state !== 'idle' && (
      <p className="text-muted text-sm">
        {diagnosis.done1h} {WORKER_LABELS.doneLastHour}
      </p>
    )}
    {diagnosis.state === 'working' && diagnosis.blockers.length > 0 && (
      <BlockerList blockers={diagnosis.blockers} />
    )}
    {diagnosis.state === 'blocked' && (
      <>
        <p>
          {diagnosis.queued} {WORKER_LABELS.blockedLead}
        </p>
        {diagnosis.blockers.length === 0 ? (
          <p className="text-muted">{WORKER_LABELS.noCause}</p>
        ) : (
          <BlockerList blockers={diagnosis.blockers} />
        )}
      </>
    )}
  </section>
)
