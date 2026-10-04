import type { CostColumn } from '../types/CostColumn'

// No spend in any day of the range: a blank plot would say nothing.
export const isCostEmpty = (columns: readonly CostColumn[]): boolean =>
  columns.every((column) => column.total <= 0)
