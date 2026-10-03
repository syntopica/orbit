import type { MemoryFlow } from '@orbit/contract'

import type { FlowStage } from './FlowStage'

export type StagePanelProps = {
  readonly stage: FlowStage
  readonly flow: MemoryFlow
  readonly onClose: () => void
}
