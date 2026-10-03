import { collapseTicker } from '../../selectors/collapseTicker'
import type { EventTickerProps } from '../../types/EventTickerProps'
import { TickerRowView } from './TickerRowView'

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
        {collapseTicker(events).map((row) => (
          <TickerRowView key={row.id} row={row} />
        ))}
      </ol>
    )}
  </section>
)
