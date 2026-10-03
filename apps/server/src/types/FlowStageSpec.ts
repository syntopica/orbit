import type { ComponentId, FlowStageId, Metric, Pending } from '@orbit/contract'

import type { FreshSource } from './FreshSource'

export type FlowStageSpec = {
  readonly id: FlowStageId
  readonly component: ComponentId
  readonly backlog: Metric['key'] | null
  readonly metrics: readonly Metric['key'][]
  readonly pending: readonly Pending['key'][]
  readonly fresh: FreshSource
  // 'refresh2x' is twice the configured atrium refresh interval (spec 3.1).
  readonly policyMs: number | 'refresh2x'
}
