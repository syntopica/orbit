import { PopulationHeaders } from './PopulationHeaders'

import { formatCount } from '../../formatters/formatCount'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { PopulationTableProps } from '../../types/PopulationTableProps'

export const PopulationTable = ({ populations }: PopulationTableProps) => {
  const missing = populations.filter((p) => p.intended > p.indexed)
  return (
    <section
      aria-label={ATRIUM_LABELS.missing}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{ATRIUM_LABELS.missing}</h2>
      {missing.length === 0 ? (
        <p className="text-muted text-sm">{ATRIUM_LABELS.allIndexed}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <PopulationHeaders />
            <tbody className="divide-line divide-y">
              {missing.map((p) => (
                <tr key={p.model}>
                  <th
                    scope="row"
                    className="py-1 pr-3 text-left font-mono font-normal"
                  >
                    {p.model}
                  </th>
                  <td className="py-1 pr-3 text-right">
                    {formatCount(p.intended)}
                  </td>
                  <td className="py-1 pr-3 text-right">
                    {formatCount(p.indexed)}
                  </td>
                  <td className="py-1 text-right">
                    {formatCount(p.intended - p.indexed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
