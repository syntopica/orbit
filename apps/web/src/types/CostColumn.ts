import type { StackColumn } from './StackColumn'

export type CostColumn = StackColumn & { readonly attempts: number }
