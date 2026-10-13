import type { RefObject } from 'react'
import type { CardModel } from './CardModel'

export type OrbitCanvasProps = {
  readonly cards: readonly CardModel[]
  readonly labels: readonly RefObject<HTMLAnchorElement | null>[]
  readonly leaders: readonly RefObject<SVGPathElement | null>[]
  readonly visible: boolean
}
