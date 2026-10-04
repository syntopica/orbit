import type { FlowStageId } from '@orbit/contract'

// Left to right in spec 3.3 order; fitView scales it to the canvas.
export const FLOW_LAYOUT: Record<FlowStageId, { x: number; y: number }> = {
  archive: { x: 0, y: 160 },
  clips: { x: 0, y: 600 },
  episodes: { x: 260, y: 260 },
  synthesis: { x: 260, y: 40 },
  curation: { x: 520, y: 360 },
  brain: { x: 780, y: 470 },
  index: { x: 1040, y: 240 },
  retrieval: { x: 1300, y: 240 },
}
