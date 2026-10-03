import type { FlowEdgeType } from './FlowEdgeType'
import type { StageNodeType } from './StageNodeType'

export type FlowGraph = {
  readonly nodes: StageNodeType[]
  readonly edges: FlowEdgeType[]
}
