import type { ExecutorListProps } from '../../types/ExecutorListProps'
import { ExecutorTableRow } from './ExecutorTableRow'

export const ExecutorTable = ({ rows }: ExecutorListProps) => (
  <details className="text-sm">
    <summary className="text-muted cursor-pointer">Show table</summary>
    <div
      role="region"
      aria-label="Executor table"
      tabIndex={0}
      className="mt-2 overflow-x-auto"
    >
      <table className="w-full text-left text-xs tabular-nums">
        <thead>
          <tr className="text-muted border-line border-b">
            <th scope="col" className="p-2">
              Executor
            </th>
            <th scope="col" className="p-2">
              Queues
            </th>
            <th scope="col" className="p-2 text-right">
              Attempts
            </th>
            <th scope="col" className="p-2 text-right">
              Success rate
            </th>
            <th scope="col" className="p-2 text-right">
              Mean judged score
            </th>
            <th scope="col" className="p-2 text-right">
              Judged
            </th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {rows.map((row) => (
            <ExecutorTableRow key={`${row.provider}:${row.model}`} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  </details>
)
