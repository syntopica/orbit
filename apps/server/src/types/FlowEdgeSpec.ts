import type { FlowStageId, Metric } from '@orbit/contract'

export type FlowEdgeSpec = {
  readonly from: FlowStageId
  readonly to: FlowStageId
  // delta: growth of a total; sum: a per-pass count summed over its samples.
  readonly counter: {
    readonly key: Metric['key']
    readonly mode: 'delta' | 'sum'
  } | null
}
