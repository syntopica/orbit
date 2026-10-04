import { formatCount } from '../../formatters/formatCount'
import { formatLocalTime } from '../../formatters/formatLocalTime'
import { formatSynthesisInput } from '../../formatters/formatSynthesisInput'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SynthesisRowDetailProps } from '../../types/SynthesisRowDetailProps'
import { SynthesisReveal } from './SynthesisReveal'

// The input by reference and the recipe; the output's text only on request.
export const SynthesisRowDetail = ({ row }: SynthesisRowDetailProps) => (
  <div className="space-y-2 py-2 text-sm">
    <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1">
      <dt className="text-muted">{ATRIUM_LABELS.inputReference}</dt>
      <dd className="font-mono break-all">{formatSynthesisInput(row)}</dd>
      <dt className="text-muted">authored</dt>
      <dd>{row.authoredAt === null ? '—' : formatLocalTime(row.authoredAt)}</dd>
      <dt className="text-muted">model</dt>
      <dd className="font-mono">
        {row.modelRequested ?? '—'} → {row.modelResolved ?? '—'}
      </dd>
      <dt className="text-muted">worker results</dt>
      <dd>{formatCount(row.workerResults)}</dd>
      <dt className="text-muted">job key</dt>
      <dd className="font-mono break-all">{row.jobKey}</dd>
    </dl>
    <SynthesisReveal jobKey={row.jobKey} />
  </div>
)
