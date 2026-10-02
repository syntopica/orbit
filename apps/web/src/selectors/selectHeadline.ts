import type { SnapshotCore } from '@orbit/contract'

import { formatMetric } from '../formatters/formatMetric'
import { METRIC_LABELS } from '../labels/metricLabels'
import { HEADLINE_METRICS } from '../screens/home/headlineMetrics'

export const selectHeadline = (core: SnapshotCore): string | null => {
  const key = HEADLINE_METRICS[core.component]
  const metric = core.metrics.find((m) => m.key === key)
  return metric === undefined
    ? null
    : `${formatMetric(metric.key, metric.value)} ${METRIC_LABELS[metric.key]}`
}
