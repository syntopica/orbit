import { WORKER_JOB_COLUMNS } from '../../labels/workerJobColumns'

export const WorkerJobsTableHead = () => (
  <thead className="text-muted text-left text-xs">
    <tr>
      {WORKER_JOB_COLUMNS.map((column) => (
        <th
          key={column.label}
          scope="col"
          className={`px-3 py-2 ${column.className}`}
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
)
