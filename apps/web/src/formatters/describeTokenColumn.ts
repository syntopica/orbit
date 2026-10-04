import type { StackColumn } from '../types/StackColumn'
import { formatCount } from './formatCount'
import { formatUtcDay } from './formatUtcDay'

// "1,200 in · 300 out, 2026-10-03"
export const describeTokenColumn = (column: StackColumn): string => {
  const [input, output] = column.segments
  return `${formatCount(input?.count ?? 0)} in · ${formatCount(output?.count ?? 0)} out, ${formatUtcDay(column.start)}`
}
