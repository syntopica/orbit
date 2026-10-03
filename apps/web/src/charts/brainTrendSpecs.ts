import { METRIC_LABELS } from '../labels/metricLabels'
import type { TrendSpec } from '../types/TrendSpec'

// A module constant, as useTrend requires (1b Task 8).
export const BRAIN_TREND_SPECS: readonly TrendSpec[] = [
  { key: 'brain.lint_issues', label: METRIC_LABELS['brain.lint_issues'] },
  { key: 'brain.doctor_failing', label: METRIC_LABELS['brain.doctor_failing'] },
]
