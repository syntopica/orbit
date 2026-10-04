import { BRAIN_LABELS } from '../labels/brainLabels'
import type { GraphDepth } from '../types/GraphDepth'

export const DEPTH_OPTIONS: readonly {
  readonly depth: GraphDepth
  readonly label: string
}[] = [
  { depth: 0, label: BRAIN_LABELS.overview },
  { depth: 1, label: BRAIN_LABELS.oneStep },
  { depth: 2, label: BRAIN_LABELS.twoSteps },
  { depth: 3, label: BRAIN_LABELS.threeSteps },
]
