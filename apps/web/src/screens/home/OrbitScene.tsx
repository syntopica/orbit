import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useOrbitLabels } from '../../hooks/useOrbitLabels'
import type { OrbitMapProps } from '../../types/OrbitMapProps'
import { OrbitCanvas } from './OrbitCanvas'
import { OrbitLabel } from './OrbitLabel'
import { useOrbitVisibility } from './OrbitVisibility'

const OrbitScene = ({ cards, now }: OrbitMapProps) => {
  const visible = useOrbitVisibility()
  useMediaQuery('(prefers-color-scheme: light)')
  const labels = useOrbitLabels(cards.length)
  return (
    <div className="orbit-stage" role="group" aria-label="Components">
      <OrbitCanvas cards={cards} labels={labels} visible={visible} />
      {cards.map((card, index) => (
        <OrbitLabel
          key={card.component}
          card={card}
          index={index}
          now={now}
          ref={labels[index] ?? null}
        />
      ))}
    </div>
  )
}

export default OrbitScene
