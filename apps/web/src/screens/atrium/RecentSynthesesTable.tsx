import { useExpandedSet } from '../../hooks/useExpandedSet'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { SYNTHESIS_COLUMNS } from '../../labels/synthesisColumns'
import type { RecentSynthesesTableProps } from '../../types/RecentSynthesesTableProps'
import { SynthesisRow } from './SynthesisRow'

export const RecentSynthesesTable = ({ view }: RecentSynthesesTableProps) => {
  const expanded = useExpandedSet()
  return view.rows.length === 0 ? (
    <p className="text-muted text-sm">{ATRIUM_LABELS.noRecent}</p>
  ) : (
    <div
      role="region"
      aria-label={ATRIUM_LABELS.recentTable}
      tabIndex={0}
      className="overflow-x-auto"
    >
      <table className="w-full text-sm tabular-nums">
        <thead className="text-muted text-left text-xs">
          <tr>
            {SYNTHESIS_COLUMNS.map((name) => (
              <th key={name} scope="col" className="py-1 pr-3 font-normal">
                {name}
              </th>
            ))}
            <th scope="col" className="py-1 font-normal">
              <span className="sr-only">{ATRIUM_LABELS.details}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {view.rows.map((row) => (
            <SynthesisRow
              key={row.jobKey}
              row={row}
              open={expanded.isOpen(row.jobKey)}
              onToggle={() => {
                expanded.toggle(row.jobKey)
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
