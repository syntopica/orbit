import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { SatelliteProps } from '../../types/SatelliteProps'
import { HealthRing } from './HealthRing'

export const Satellite = ({ card, at, animate }: SatelliteProps) => (
  <g
    role="img"
    aria-label={[`${card.label}: ${HEALTH_LABELS[card.state]}`, card.headline]
      .filter(Boolean)
      .join(', ')}
    transform={`translate(${String(at.x)} ${String(at.y)})`}
  >
    {animate ? (
      <circle
        key={card.observedAt}
        data-testid="pulse"
        r={34}
        className="stroke-accent animate-pulse-ring origin-center fill-none transform-fill"
      />
    ) : null}
    <HealthRing state={card.state} greyed={card.greyed} />
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
  </g>
)
