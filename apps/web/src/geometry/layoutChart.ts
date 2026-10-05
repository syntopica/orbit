import { scaleLinear } from '@visx/scale'

import { CHART_MARGIN } from '../charts/chartMargin'
import { formatTickCount } from '../formatters/formatTickCount'
import type { ChartLayout } from '../types/ChartLayout'
import type { StackColumn } from '../types/StackColumn'
import { barWidth } from './barWidth'
import { layoutStack } from './layoutStack'
import { xAxisTicks } from './xAxisTicks'

// Pixel geometry for a stacked column chart; the whole band is the hit target.
export const layoutChart = (
  columns: readonly StackColumn[],
  width: number,
  height: number,
  bucketMs: number,
): ChartLayout => {
  const frame = { width, height, ...CHART_MARGIN }
  const step = (width - frame.left - frame.right) / Math.max(1, columns.length)
  const bar = barWidth(step)
  const max = Math.max(1, ...columns.map((c) => c.total))
  const y = scaleLinear<number>({
    domain: [0, max],
    range: [height - frame.bottom, frame.top],
    nice: true,
  })
  const laid = columns.map((column, i) => {
    const bandX = frame.left + i * step
    const center = bandX + step / 2
    return {
      x: center - bar / 2,
      center,
      bandX,
      bandWidth: step,
      barWidth: bar,
      rects: layoutStack(column.segments, (v) => y(v)),
    }
  })
  const yTicks = y
    .ticks(3)
    .filter((value) => Number.isInteger(value) || max < 1)
    .map((value) => ({ at: y(value), label: formatTickCount(value) }))
  const starts = columns.map((c) => c.start)
  const centers = laid.map((c) => c.center)
  return {
    frame,
    columns: laid,
    yTicks,
    xTicks: xAxisTicks(starts, centers, bucketMs),
  }
}
