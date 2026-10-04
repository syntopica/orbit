import type { WorkerJobsTableProps } from '../../types/WorkerJobsTableProps'
import { WorkerJobsTableHead } from './WorkerJobsTableHead'
import { WorkerJobsTableRow } from './WorkerJobsTableRow'

export const WorkerJobsTable = ({ jobs }: WorkerJobsTableProps) => (
  <table className="border-line bg-panel w-full table-fixed rounded-xl border text-sm">
    <WorkerJobsTableHead />
    <tbody className="divide-line divide-y">
      {jobs.map((job) => (
        <WorkerJobsTableRow key={job.id} job={job} />
      ))}
    </tbody>
  </table>
)
