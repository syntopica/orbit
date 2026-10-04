import type { CostColumn } from '../types/CostColumn'
import { formatUsd } from './formatUsd'

export const formatCostSummary = (column: CostColumn): string =>
  `${new Date(column.start).toLocaleDateString('en-GB', { timeZone: 'UTC' })}: ${formatUsd(column.total)}, ${String(column.attempts)} attempts`
