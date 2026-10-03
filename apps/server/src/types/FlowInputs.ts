import type { ComponentId, FlowStageId, Snapshot } from '@orbit/contract'

import type { AtriumDocuments } from './AtriumDocuments'

export type FlowInputs = {
  readonly now: number
  readonly snapshots: ReadonlyMap<ComponentId, Snapshot>
  readonly atrium: AtriumDocuments | null
  readonly refreshIntervalMs: number | null
  readonly labels: ReadonlyMap<FlowStageId, string>
  readonly lastRuns: ReadonlyMap<string, number>
  readonly totals: ReadonlyMap<string, number | null>
}
