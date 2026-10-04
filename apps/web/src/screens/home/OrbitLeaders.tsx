import type { RefObject } from 'react'

import type { CardModel } from '../../types/CardModel'

export const OrbitLeaders = ({
  cards,
  leaders,
}: {
  readonly cards: readonly CardModel[]
  readonly leaders: readonly RefObject<SVGPathElement | null>[]
}) => (
  <svg className="orbit-leaders" aria-hidden="true" focusable="false">
    <defs>
      <marker
        id="orbit-leader-dot"
        markerWidth="6"
        markerHeight="6"
        refX="3"
        refY="3"
        markerUnits="userSpaceOnUse"
      >
        <circle cx="3" cy="3" r="2.5" fill="var(--color-accent)" />
      </marker>
    </defs>
    {cards.map((card, index) => (
      <path
        key={card.component}
        ref={leaders[index]}
        data-component={card.component}
        markerEnd="url(#orbit-leader-dot)"
      />
    ))}
  </svg>
)
