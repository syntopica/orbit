import { formatReadingAge } from '../../formatters/formatReadingAge'
import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { SatelliteProps } from '../../types/SatelliteProps'
import { HealthRing } from './HealthRing'

export const Satellite = ({ card, at, animate, now }: SatelliteProps) => (
  <g
    role="img"
    aria-label={[
      `${card.label}: ${HEALTH_LABELS[card.state]}`,
      card.headline,
      card.greyed ? formatReadingAge(card.observedAt, now) : null,
    ]
      .filter(Boolean)
      .join(', ')}
    data-greyed={card.greyed}
    opacity={card.greyed ? 0.5 : 1}
    transform={`translate(${String(at.x)} ${String(at.y)})`}
  >
    {animate && !card.greyed ? (
      <circle
        key={card.observedAt}
        data-testid="pulse"
        r={34}
        className="stroke-accent animate-pulse-ring origin-center fill-none transform-fill"
      />
    ) : null}
    <HealthRing state={card.state} />
    <text
      y={4}
      textAnchor="middle"
      className="fill-ink text-[11px] font-semibold"
    >
      {card.label}
    </text>
    {card.headline !== null && (
      <text
        y={56}
        textAnchor="middle"
        className="fill-muted font-mono text-[11px]"
      >
        {card.headline}
      </text>
    )}
    {card.greyed ? (
      <text
        y={70}
        textAnchor="middle"
        className="fill-muted font-mono text-[11px]"
      >
        {formatReadingAge(card.observedAt, now)}
      </text>
    ) : null}
  </g>
)
