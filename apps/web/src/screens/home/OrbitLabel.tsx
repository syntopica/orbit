import { Link } from '@tanstack/react-router'
import type { Ref } from 'react'

import { formatReadingAge } from '../../formatters/formatReadingAge'
import { HEALTH_LABELS } from '../../labels/healthLabels'
import type { CardModel } from '../../types/CardModel'
import { orbitDestination } from './orbitDestination'

export const OrbitLabel = ({
  card,
  index,
  now,
  ref,
}: {
  readonly card: CardModel
  readonly index: number
  readonly now: number
  readonly ref: Ref<HTMLAnchorElement>
}) => (
  <Link
    ref={ref}
    to={orbitDestination(card.component)}
    className="orbit-label"
    data-state={card.state}
    data-greyed={card.greyed}
    data-lane={index < 3 ? 'inner' : 'outer'}
  >
    <span
      role="img"
      aria-label={[
        `${card.label}: ${HEALTH_LABELS[card.state]}`,
        card.headline,
        card.greyed ? formatReadingAge(card.observedAt, now) : null,
      ]
        .filter(Boolean)
        .join(', ')}
      className="contents"
    >
      <span className="orbit-label-name">
        {card.greyed ? null : (
          <span className="orbit-label-pulse" data-testid="pulse" />
        )}
        {card.label}
      </span>
      {card.headline === null ? null : (
        <span className="orbit-label-metric">{card.headline}</span>
      )}
      {card.greyed ? (
        <span className="orbit-label-age">
          {formatReadingAge(card.observedAt, now)}
        </span>
      ) : null}
    </span>
  </Link>
)
