import { formatAttemptTokens } from '../../formatters/formatAttemptTokens'
import { formatDuration } from '../../formatters/formatDuration'
import { formatLocalTime } from '../../formatters/formatLocalTime'
import { formatSynthesisResult } from '../../formatters/formatSynthesisResult'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SynthesisRowProps } from '../../types/SynthesisRowProps'
import { SynthesisRowDetail } from './SynthesisRowDetail'

// One record; its detail row mounts only while open, so revealed content
// leaves the cache when the row closes.
export const SynthesisRow = ({ row, open, onToggle }: SynthesisRowProps) => (
  <>
    <tr>
      <th scope="row" className="py-1 pr-3 text-left font-normal">
        {formatLocalTime(row.writtenAt)}
      </th>
      <td className="py-1 pr-3 font-mono">
        {row.source ?? '—'}
        {row.kind === 'session' ? ' · session' : ''}
      </td>
      <td className="py-1 pr-3 font-mono">
        {row.modelResolved ?? row.modelRequested ?? '—'}
      </td>
      <td className="py-1 pr-3 text-right">
        {formatAttemptTokens(row.inputTokens, row.outputTokens)}
      </td>
      <td className="py-1 pr-3 text-right">
        {row.durationMs === null
          ? ATRIUM_LABELS.notRecorded
          : formatDuration(row.durationMs)}
      </td>
      <td className="py-1 pr-3">{formatSynthesisResult(row)}</td>
      <td className="py-1 text-right">
        <button
          type="button"
          aria-expanded={open}
          className="text-accent cursor-pointer underline"
          onClick={onToggle}
        >
          {open ? ATRIUM_LABELS.hideDetails : ATRIUM_LABELS.details}
        </button>
      </td>
    </tr>
    {open ? (
      <tr>
        <td colSpan={7}>
          <SynthesisRowDetail row={row} />
        </td>
      </tr>
    ) : null}
  </>
)
