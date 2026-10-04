import { hasJobCost } from '../../selectors/hasJobCost'
import type { WorkerJobsTableProps } from '../../types/WorkerJobsTableProps'
import { WorkerJobsTableHead } from './WorkerJobsTableHead'
import { WorkerJobsTableRow } from './WorkerJobsTableRow'

// Columns size to their content, so a queue or model name is never cut to
// two letters; a narrow window scrolls the table rather than truncating it.
export const WorkerJobsTable = ({ jobs }: WorkerJobsTableProps) => {
  const showCost = hasJobCost(jobs)
  return (
    <div className="border-line bg-panel overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <WorkerJobsTableHead showCost={showCost} />
        <tbody className="divide-line divide-y">
          {jobs.map((job) => (
            <WorkerJobsTableRow key={job.id} job={job} showCost={showCost} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
