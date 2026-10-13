import { BRAIN_LABELS } from '../labels/brainLabels'
import type { DepthOption } from '../types/DepthOption'

export const DEPTH_OPTIONS: readonly DepthOption[] = [
  { depth: 0, label: BRAIN_LABELS.overview },
  { depth: 1, label: BRAIN_LABELS.oneStep },
  { depth: 2, label: BRAIN_LABELS.twoSteps },
  { depth: 3, label: BRAIN_LABELS.threeSteps },
]
