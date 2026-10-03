import type { FlowInputs } from './FlowInputs'
import type { FlowStageSpec } from './FlowStageSpec'

export type FreshReader = (
  spec: FlowStageSpec,
  inputs: FlowInputs,
) => number | null
