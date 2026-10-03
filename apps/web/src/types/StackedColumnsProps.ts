import type { ReactNode } from 'react'

import type { StackColumn } from './StackColumn'

export type StackedColumnsProps<C extends StackColumn> = {
  readonly columns: readonly C[]
  readonly bucketMs: number
  readonly fills: Readonly<Record<string, string>>
  readonly label: string
  readonly height: number
  readonly describe: (column: C) => string
  readonly renderTooltip: (column: C) => ReactNode
}
