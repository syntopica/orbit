import { Link } from '@tanstack/react-router'

import { orbitPosition } from '../../geometry/orbitPosition'
import type { OrbitMapProps } from '../../types/OrbitMapProps'
import { orbitDestination } from './orbitDestination'
import { Satellite } from './Satellite'

export const OrbitMap = ({ cards, animate, now }: OrbitMapProps) => (
  <svg
    viewBox="-300 -300 600 600"
    className="mx-auto block w-full max-w-2xl"
    role="group"
    aria-label="Components"
  >
    <circle
      r={220}
      className="stroke-line fill-none"
      strokeDasharray="2 6"
      aria-hidden="true"
    />
    <circle
      r={120}
      className="stroke-line fill-none"
      strokeDasharray="2 6"
      aria-hidden="true"
    />
    <circle r={44} className="fill-panel stroke-accent" aria-hidden="true" />
    <text
      y={5}
      textAnchor="middle"
      className="fill-accent font-mono text-sm"
      aria-hidden="true"
    >
      orbit
    </text>
    {cards.map((card, index) => (
      <Link
        key={card.component}
        to={orbitDestination(card.component)}
        className="cursor-pointer hover:brightness-125"
      >
        <Satellite
          card={card}
          at={orbitPosition(index, cards.length, 220)}
          animate={animate}
          now={now}
        />
      </Link>
    ))}
  </svg>
)
