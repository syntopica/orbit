import { FLOW_STAGE_LABELS } from '../labels/flowStageLabels'
import { FRESHNESS_LABELS } from '../labels/freshnessLabels'
import { METRIC_LABELS } from '../labels/metricLabels'
import type { FlowStage } from '../types/FlowStage'
import { formatCount } from './formatCount'

// "Index: Fresh, 2 not indexed": the visible title first (label in name).
export const formatStageName = (stage: FlowStage): string => {
  const head = `${FLOW_STAGE_LABELS[stage.id].title}: ${FRESHNESS_LABELS[stage.state]}`
  return stage.backlog === null
    ? head
    : `${head}, ${formatCount(stage.backlog.value)} ${METRIC_LABELS[stage.backlog.key]}`
}
