import type { ReactNode } from 'react'

import type { ColumnFocus } from './ColumnFocus'

export type ChartSliderProps = {
  readonly label: string
  readonly count: number
  readonly valueText: string
  readonly width: number
  readonly height: number
  readonly focus: ColumnFocus
  readonly children: ReactNode
}
