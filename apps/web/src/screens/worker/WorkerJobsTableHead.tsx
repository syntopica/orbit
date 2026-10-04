import { COLUMN_VISIBILITY } from '../../labels/columnVisibility'
import { WORKER_JOB_COLUMNS } from '../../labels/workerJobColumns'
import type { WorkerJobsTableHeadProps } from '../../types/WorkerJobsTableHeadProps'

export const WorkerJobsTableHead = ({ showCost }: WorkerJobsTableHeadProps) => (
  <thead className="text-muted text-left text-xs">
    <tr>
      {WORKER_JOB_COLUMNS.filter(
        (column) => showCost || column.label !== 'Cost',
      ).map((column) => (
        <th
          key={column.label}
          scope="col"
          className={`p-2 whitespace-nowrap ${COLUMN_VISIBILITY[column.hideBelow ?? 'none']} ${column.numeric ? 'text-right' : ''}`}
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
)
