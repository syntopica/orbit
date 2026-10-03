import type { RefObject } from 'react'
import type { Texture } from 'three'

import type { CardModel } from './CardModel'

export type OrbitSatellite3dProps = {
  readonly card: CardModel
  readonly index: number
  readonly color: string
  readonly label: RefObject<HTMLAnchorElement | null>
  readonly light: boolean
  readonly texture: Texture
}
