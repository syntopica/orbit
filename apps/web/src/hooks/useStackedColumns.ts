import { useMemo } from 'react'

import { layoutChart } from '../geometry/layoutChart'
import type { StackColumn } from '../types/StackColumn'
import type { StackedColumnsModel } from '../types/StackedColumnsModel'
import { useChartWidth } from './useChartWidth'
import { useColumnFocus } from './useColumnFocus'

export const useStackedColumns = (
  columns: readonly StackColumn[],
  height: number,
  bucketMs: number,
): StackedColumnsModel => {
  const { parentRef, width } = useChartWidth()
  const focus = useColumnFocus(columns.length)
  const layout = useMemo(
    () => layoutChart(columns, width, height, bucketMs),
    [columns, width, height, bucketMs],
  )
  return { parentRef, layout, focus }
}
