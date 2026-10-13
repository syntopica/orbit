import type { RefObject } from 'react'
import type { CardModel } from './CardModel'

export type OrbitLeadersProps = {
  readonly cards: readonly CardModel[]
  readonly leaders: readonly RefObject<SVGPathElement | null>[]
}
