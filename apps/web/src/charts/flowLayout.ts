import type { FlowStageId } from '@orbit/contract'

// Left to right in spec 3.3 order; fitView scales it to the canvas.
export const FLOW_LAYOUT: Record<FlowStageId, { x: number; y: number }> = {
  archive: { x: 0, y: 160 },
  clips: { x: 0, y: 400 },
  episodes: { x: 260, y: 40 },
  synthesis: { x: 260, y: 240 },
  curation: { x: 520, y: 40 },
  brain: { x: 520, y: 400 },
  index: { x: 780, y: 240 },
  retrieval: { x: 1040, y: 240 },
}
