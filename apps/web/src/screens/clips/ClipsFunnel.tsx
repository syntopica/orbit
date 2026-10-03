import { formatCount } from '../../formatters/formatCount'
import { formatDuration } from '../../formatters/formatDuration'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { ClipsFunnelProps } from '../../types/ClipsFunnelProps'

// Broken wears the warn colour and always its label (spec 7.1).
export const ClipsFunnel = ({ rows, capture, now }: ClipsFunnelProps) => {
  const widest = Math.max(1, ...rows.map((row) => row.count))
  return (
    <section
      aria-label={CLIPS_LABELS.funnel}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.funnel}</h2>
      <ol aria-label={CLIPS_LABELS.funnelList} className="space-y-2 text-sm">
        {capture === null ? null : (
          <li className="flex flex-wrap justify-between gap-x-3">
            <span>{CLIPS_LABELS.captureLane}</span>
            <span className="shrink-0 tabular-nums">
              {formatCount(capture.count)} {CLIPS_LABELS.waiting}
              {capture.oldestAt === null
                ? ''
                : `, ${CLIPS_LABELS.oldest} ${formatDuration(now - capture.oldestAt)}`}
            </span>
          </li>
        )}
        {rows.map((row) => (
          <li key={row.id} className="space-y-1">
            <div className="flex justify-between gap-3">
              <span className="min-w-0 wrap-anywhere">{row.label}</span>
              <span className="shrink-0 tabular-nums">
                {formatCount(row.count)}
              </span>
            </div>
            <div aria-hidden="true" className="bg-line h-1.5 rounded-full">
              <div
                className={`h-full rounded-full ${row.broken ? 'bg-warn' : 'bg-series-1'}`}
                style={{ width: `${String((100 * row.count) / widest)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className="text-muted text-xs">{CLIPS_LABELS.unmeasuredLanes}</p>
    </section>
  )
}
