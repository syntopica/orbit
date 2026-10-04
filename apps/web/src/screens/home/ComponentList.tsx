import { formatAge } from '../../formatters/formatAge'
import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { ComponentListProps } from '../../types/ComponentListProps'

export const ComponentList = ({ cards, now }: ComponentListProps) => (
  <ul className="space-y-2">
    {cards.map((card) => (
      <li
        key={card.component}
        aria-label={`${card.label}: ${HEALTH_LABELS[card.state]}`}
        data-greyed={card.greyed}
        className="border-line bg-panel grid grid-cols-[auto_minmax(0,1fr)_9rem_2.5rem] items-center gap-3 rounded-xl border p-3 data-[greyed=true]:border-dashed"
      >
        <span
          aria-hidden="true"
          data-state={card.state}
          className="data-[state=down]:bg-down data-[state=ok]:bg-ok data-[state=warn]:bg-warn size-2.5 rounded-full"
        />
        <span className="min-w-0">
          <span className="block font-semibold">{card.label}</span>
          <span className="text-muted block text-xs">
            {card.reason ?? HEALTH_LABELS[card.state]}
          </span>
        </span>
        <span className="truncate text-right font-mono text-sm">
          {card.headline}
        </span>
        <span className="text-muted text-right font-mono text-xs">
          {formatAge(card.observedAt, now)}
        </span>
      </li>
    ))}
  </ul>
)
