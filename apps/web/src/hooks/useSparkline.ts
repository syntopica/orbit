import { useMemo } from 'react'

import { sparkPoints } from '../geometry/sparkPoints'
import type { SparklineModel } from '../types/SparklineModel'
import { useChartWidth } from './useChartWidth'
import { useColumnFocus } from './useColumnFocus'

export const useSparkline = (
  values: readonly number[],
  height: number,
): SparklineModel => {
  const { parentRef, width } = useChartWidth()
  const focus = useColumnFocus(values.length)
  const points = useMemo(
    () => sparkPoints(values, width, height),
    [values, width, height],
  )
  return {
    parentRef,
    width,
    step: width / Math.max(1, values.length),
    points,
    focus,
  }
}
