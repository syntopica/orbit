import { WORKER_COSTS_RANGE_OPTIONS } from '../../charts/workerCostsRangeOptions'
import { useWorkerCosts } from '../../hooks/useWorkerCosts'
import { RangePicker } from '../system/RangePicker'
import { CostsPanel } from './CostsPanel'

export const CostsSection = () => {
  const costs = useWorkerCosts()
  return (
    <section aria-labelledby="costs-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="costs-heading"
          className="text-muted text-sm font-semibold uppercase"
        >
          Costs
        </h2>
        <RangePicker
          options={WORKER_COSTS_RANGE_OPTIONS}
          range={costs.range}
          onChange={costs.setRange}
        />
      </div>
      {costs.failed ? (
        <p className="text-muted text-sm">Could not read worker costs.</p>
      ) : null}
      {costs.view === null && !costs.failed ? (
        <p className="text-muted text-sm">Reading costs…</p>
      ) : null}
      {costs.view !== null ? (
        <CostsPanel view={costs.view} range={costs.range} stale={costs.stale} />
      ) : null}
    </section>
  )
}
