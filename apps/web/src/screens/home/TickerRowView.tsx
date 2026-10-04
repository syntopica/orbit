import { formatActionEvent } from '../../formatters/formatActionEvent'
import { formatClock } from '../../formatters/formatClock'
import { formatDuration } from '../../formatters/formatDuration'
import { formatEventRefs } from '../../formatters/formatEventRefs'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { EVENT_LABELS } from '../../labels/eventLabels'
import { TICKER_LABELS } from '../../labels/tickerLabels'
import type { TickerRowProps } from '../../types/TickerRowProps'

export const TickerRowView = ({ row: { event, ranMs } }: TickerRowProps) => (
  <li
    id={
      event.kind.startsWith('action.')
        ? `action-${String(event.refs['id'] ?? '')}${event.kind === 'action.started' ? '' : '-complete'}`
        : undefined
    }
    className="flex flex-wrap gap-x-3 px-3 py-2 text-sm"
  >
    <time dateTime={event.at} className="text-muted font-mono">
      {formatClock(event.at)}
    </time>
    <span
      aria-hidden="true"
      data-severity={event.severity}
      className="bg-unknown data-[severity=error]:bg-down data-[severity=warn]:bg-warn mt-1.5 size-2 rounded-full"
    />
    {formatActionEvent(event) === null ? (
      <span className="font-semibold">{COMPONENT_LABELS[event.component]}</span>
    ) : null}
    <span>
      {formatActionEvent(event) ??
        (ranMs === null
          ? EVENT_LABELS[event.kind]
          : `${TICKER_LABELS.ran} ${formatDuration(ranMs)}`)}
    </span>
    {formatActionEvent(event) === null && formatEventRefs(event) !== '' && (
      <span className="text-muted min-w-0 font-mono break-all">
        {formatEventRefs(event)}
      </span>
    )}
  </li>
)
