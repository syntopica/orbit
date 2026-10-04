import { useWorkerQuality } from '../../hooks/useWorkerQuality'
import { selectExecutors } from '../../selectors/selectExecutors'
import type { ExecutorsSectionProps } from '../../types/ExecutorsSectionProps'
import { ExecutorList } from './ExecutorList'
import { ExecutorTable } from './ExecutorTable'

export const ExecutorsSection = ({ cooldowns, now }: ExecutorsSectionProps) => {
  const quality = useWorkerQuality()
  const rows =
    quality.view === null ? [] : selectExecutors(quality.view, cooldowns)
  return (
    <section aria-labelledby="executors-heading" className="space-y-3">
      <h2
        id="executors-heading"
        className="text-muted text-sm font-semibold uppercase"
      >
        Executors
      </h2>
      {quality.failed ? (
        <p className="text-muted text-sm">Could not read worker quality.</p>
      ) : null}
      {quality.view === null && !quality.failed ? (
        <p className="text-muted text-sm">Reading executors…</p>
      ) : null}
      {quality.view !== null && rows.length === 0 ? (
        <p className="text-muted text-sm">
          No executor attempts in the last 7 days.
        </p>
      ) : null}
      {rows.length > 0 ? (
        <>
          <ExecutorList rows={rows} now={now} />
          <ExecutorTable rows={rows} now={now} />
        </>
      ) : null}
    </section>
  )
}
