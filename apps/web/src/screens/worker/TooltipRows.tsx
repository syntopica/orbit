import { formatCount } from '../../formatters/formatCount'
import type { TooltipRowsProps } from '../../types/TooltipRowsProps'

// Value strong, name secondary, a short line key in the series colour;
// top of the stack first, as drawn.
export const TooltipRows = ({ entries, keys }: TooltipRowsProps) => (
  <ul className="space-y-0.5">
    {entries.toReversed().map((entry) => (
      <li key={entry.key} className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-0.5 w-3 rounded-full ${keys[entry.key] ?? 'bg-unknown'}`}
        />
        <strong className="text-ink font-semibold tabular-nums">
          {formatCount(entry.count)}
        </strong>
        <span className="text-muted font-mono">{entry.key}</span>
      </li>
    ))}
  </ul>
)
