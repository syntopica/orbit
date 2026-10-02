import type { CardModel } from './CardModel'
import type { Point } from './Point'

export type SatelliteProps = {
  readonly card: CardModel
  readonly at: Point
  readonly animate: boolean
}
