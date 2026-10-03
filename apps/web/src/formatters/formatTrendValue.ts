import { TREND_LABELS } from '../labels/trendLabels'
import { formatCount } from './formatCount'

export const formatTrendValue = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? TREND_LABELS.noData
    : formatCount(value)
