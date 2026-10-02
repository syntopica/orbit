import { formatClock } from '../../formatters/formatClock'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { EVENT_LABELS } from '../../labels/eventLabels'
import type { EventTickerProps } from '../../types/EventTickerProps'

export const EventTicker = ({ events }: EventTickerProps) => (
  <section aria-labelledby="events-heading" className="space-y-2">
    <h2
      id="events-heading"
      className="text-muted text-sm font-semibold uppercase"
    >
      Recent events
    </h2>
    {events.length === 0 ? (
      <p className="text-muted text-sm">No events yet.</p>
    ) : (
      <ol className="divide-line border-line bg-panel divide-y rounded-xl border">
        {events.map((event) => (
          <li
            key={`${event.at}:${event.component}:${event.kind}:${JSON.stringify(event.refs)}`}
            className="flex gap-3 px-3 py-2 text-sm"
          >
            <time dateTime={event.at} className="text-muted font-mono">
              {formatClock(event.at)}
            </time>
            <span
              aria-hidden="true"
              data-severity={event.severity}
              className="bg-unknown data-[severity=error]:bg-down data-[severity=warn]:bg-warn mt-1.5 size-2 rounded-full"
            />
            <span className="font-semibold">
              {COMPONENT_LABELS[event.component]}
            </span>
            <span>{EVENT_LABELS[event.kind]}</span>
          </li>
        ))}
      </ol>
    )}
  </section>
)
