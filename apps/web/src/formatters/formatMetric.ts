import type { Metric } from '@orbit/contract'

import { formatDuration } from './formatDuration'

export const formatMetric = (key: Metric['key'], value: number): string =>
  key === 'worker.wasted_1h_s'
    ? formatDuration(value * 1000)
    : new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value)
