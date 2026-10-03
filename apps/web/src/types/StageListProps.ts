import type { FlowStageId, MemoryFlow } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StageListProps = {
  readonly flow: MemoryFlow | null
  readonly stages: readonly FlowStage[]
  readonly selectedId: FlowStageId | null
  readonly onSelect: (id: FlowStageId | null) => void
}
