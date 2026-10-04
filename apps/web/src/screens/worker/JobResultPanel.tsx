import type { WorkerJobDetail } from '@orbit/contract'

import { formatJobResult } from '../../formatters/formatJobResult'
import { resultSummaryItems } from '../../selectors/resultSummaryItems'
import { LabelledValueList } from './LabelledValueList'

// Metadata only, so it needs no reveal: the output body stays in Content.
export const JobResultPanel = ({ job }: { job: WorkerJobDetail }) => (
  <section
    aria-label="Result"
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">Result</h2>
    <p className="text-sm">
      <span className="text-muted">Latest attempt </span>
      <span className="font-mono">{formatJobResult(job)}</span>
    </p>
    {job.results.length === 0 ? <p>No result stored yet.</p> : null}
    <ol className="space-y-3">
      {job.results.map((result) => (
        <li
          key={result.resultId}
          className="border-line border-t pt-3 first:border-t-0 first:pt-0"
        >
          <LabelledValueList items={resultSummaryItems(result)} />
        </li>
      ))}
    </ol>
  </section>
)
