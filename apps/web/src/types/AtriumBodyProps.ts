import type { AtriumView } from '@orbit/contract'

import type { AtriumModel } from './AtriumModel'

export type AtriumBodyProps = {
  readonly view: AtriumView
  readonly model: AtriumModel
}
