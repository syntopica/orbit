import { formatAge } from '../../formatters/formatAge'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { PendingStripProps } from '../../types/PendingStripProps'

export const PendingStrip = ({ rows, now }: PendingStripProps) => (
  <section aria-labelledby="pending-heading" className="space-y-2">
    <h2
      id="pending-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      Pending
    </h2>
    {rows.length === 0 ? (
      <p className="text-muted text-sm">Nothing pending.</p>
    ) : (
      <ul className="flex gap-2 overflow-x-auto pb-2">
        {rows.map((row) => (
          <li
            key={`${row.component}:${row.key}`}
            aria-label={`${COMPONENT_LABELS[row.component]} ${row.label}`}
            className="border-line bg-panel shrink-0 rounded-xl border px-3 py-2 text-sm"
          >
            <span className="font-mono text-lg">{row.count}</span>{' '}
            {COMPONENT_LABELS[row.component]} · {row.label}
            {row.stale ? (
              <span className="text-warn block text-xs">last known</span>
            ) : null}
            {row.oldestAt !== null && (
              <span className="text-muted block text-xs">
                oldest {formatAge(row.oldestAt, now)}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
)
