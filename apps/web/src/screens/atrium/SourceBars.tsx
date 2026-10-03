import { formatCount } from '../../formatters/formatCount'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SourceBarsProps } from '../../types/SourceBarsProps'

// Numbers are printed beside each bar, so no table is needed to read them.
export const SourceBars = ({ records }: SourceBarsProps) => (
  <section
    aria-label={ATRIUM_LABELS.sources}
    className="border-line bg-panel min-w-0 space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.sources}</h2>
    <p className="text-muted text-sm">
      {formatCount(records.total)} {ATRIUM_LABELS.records}
    </p>
    <ul className="space-y-2 text-sm">
      {records.bySource.map(({ source, count }) => (
        <li key={source} className="space-y-1">
          <div className="flex justify-between gap-3">
            <span className="min-w-0 font-mono break-all">{source}</span>
            <span className="shrink-0 tabular-nums">{formatCount(count)}</span>
          </div>
          <div aria-hidden="true" className="bg-line h-1.5 rounded-full">
            <div
              className="bg-series-1 h-full rounded-full"
              style={{
                width: `${String((100 * count) / Math.max(1, records.total))}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  </section>
)
