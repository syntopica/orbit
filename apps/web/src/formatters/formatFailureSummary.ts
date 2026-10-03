import type { StackColumn } from '../types/StackColumn'
import { formatBucketRange } from './formatBucketRange'
import { formatCount } from './formatCount'
import { formatCounts } from './formatCounts'

export const formatFailureSummary = (column: StackColumn): string =>
  `${formatBucketRange(column.start, column.end)}: ${formatCount(column.total)} failures${column.total > 0 ? `, ${formatCounts(column.segments)}` : ''}`
