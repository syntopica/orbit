import type { ExecutorListProps } from '../../types/ExecutorListProps'
import { ExecutorTableRow } from './ExecutorTableRow'

// Sorted by attempts upstream; a phone scrolls the table, not the page.
export const ExecutorTable = ({ rows, now }: ExecutorListProps) => (
  <div
    role="region"
    aria-label="Executor table"
    tabIndex={0}
    className="border-line bg-panel overflow-x-auto rounded-xl border"
  >
    <table className="w-full min-w-176 table-fixed text-sm tabular-nums">
      <thead className="text-muted text-left text-xs">
        <tr>
          <th scope="col" className="px-3 py-2">
            Executor
          </th>
          <th scope="col" className="w-40 px-3 py-2">
            Queues
          </th>
          <th scope="col" className="w-20 px-3 py-2 text-right">
            Attempts
          </th>
          <th scope="col" className="w-24 px-3 py-2 text-right">
            Succeeded
          </th>
          <th scope="col" className="w-32 px-3 py-2 text-right">
            Mean judged score
          </th>
          <th scope="col" className="w-16 px-3 py-2 text-right">
            Judged
          </th>
        </tr>
      </thead>
      <tbody className="divide-line divide-y">
        {rows.map((row) => (
          <ExecutorTableRow
            key={`${row.provider}:${row.model}`}
            row={row}
            now={now}
          />
        ))}
      </tbody>
    </table>
  </div>
)
