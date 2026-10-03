import type { FlowStageId, MemoryFlow } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type MemoryFlowModel = {
  readonly flow: MemoryFlow | null
  readonly failed: boolean
  readonly staleAgeMs: number | null
  readonly isPhone: boolean
  readonly animate: boolean
  readonly selected: FlowStage | null
  readonly select: (id: FlowStageId | null) => void
}
