import { orbitColorToken } from '../../geometry/orbitColorToken'
import type { OrbitSatellitesProps } from '../../types/OrbitSatellitesProps'
import { OrbitSatellite3d } from './OrbitSatellite3d'
import { OrbitTrail } from './OrbitTrail'

export const OrbitSatellites = ({
  cards,
  labels,
  light,
  styles,
  texture,
}: OrbitSatellitesProps) =>
  cards.map((card, index) => {
    const label = labels[index]
    if (!label) return null
    const color = styles.getPropertyValue(orbitColorToken(card)).trim()
    return (
      <group key={card.component}>
        <OrbitTrail color={color} index={index} light={light} />
        <OrbitSatellite3d
          card={card}
          index={index}
          color={color}
          label={label}
          light={light}
          texture={texture}
        />
      </group>
    )
  })
