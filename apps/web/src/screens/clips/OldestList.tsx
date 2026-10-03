import { formatDuration } from '../../formatters/formatDuration'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { OldestListProps } from '../../types/OldestListProps'

// Terminal states are excluded; waiting items may have no measured age.
export const OldestList = ({ states, now }: OldestListProps) => {
  const waiting = states.flatMap((s) =>
    s.state === 'reconciled' || s.state === 'archived' || s.count === 0
      ? []
      : [
          {
            state: s.state,
            ageMs: s.oldestAt === null ? null : now - s.oldestAt,
          },
        ],
  )
  return (
    <section
      aria-label={CLIPS_LABELS.oldestWaiting}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.oldestWaiting}</h2>
      {waiting.length === 0 ? (
        <p className="text-muted text-sm">{CLIPS_LABELS.nothingWaiting}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {waiting.map((w) => (
            <li key={w.state} className="flex justify-between gap-3">
              <span className="min-w-0 font-mono wrap-anywhere">{w.state}</span>
              <span className="shrink-0 tabular-nums">
                {w.ageMs === null
                  ? CLIPS_LABELS.unknownAge
                  : formatDuration(w.ageMs)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
