import type { FlowStageId, MemoryFlow } from '@orbit/contract'

export type FlowCanvasProps = {
  readonly flow: MemoryFlow
  readonly selectedId: FlowStageId | null
  readonly onSelect: (id: FlowStageId | null) => void
  readonly animate: boolean
}
