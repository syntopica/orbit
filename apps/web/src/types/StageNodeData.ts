import type { FlowStageId } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StageNodeData = {
  readonly stage: FlowStage
  readonly selected: boolean
  readonly onSelect: (id: FlowStageId | null) => void
}
