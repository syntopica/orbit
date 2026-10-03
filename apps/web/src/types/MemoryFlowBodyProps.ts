import type { MemoryFlow } from '@orbit/contract'

import type { MemoryFlowModel } from './MemoryFlowModel'

export type MemoryFlowBodyProps = {
  readonly flow: MemoryFlow
  readonly model: MemoryFlowModel
}
