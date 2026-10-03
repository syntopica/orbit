import type { ActivityColumn } from '../types/ActivityColumn'
import { formatBucketRange } from './formatBucketRange'
import { formatCount } from './formatCount'

export const formatActivitySummary = (column: ActivityColumn): string =>
  `${formatBucketRange(column.start, column.end)}: ${formatCount(column.total)} attempts, ${formatCount(column.failed)} failed, ${formatCount(column.sampling)} sampling`
