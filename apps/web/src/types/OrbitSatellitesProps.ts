import type { RefObject } from 'react'
import type { Texture } from 'three'
import type { CardModel } from './CardModel'

export type OrbitSatellitesProps = {
  readonly cards: readonly CardModel[]
  readonly labels: readonly RefObject<HTMLAnchorElement | null>[]
  readonly light: boolean
  readonly styles: CSSStyleDeclaration
  readonly texture: Texture
}
