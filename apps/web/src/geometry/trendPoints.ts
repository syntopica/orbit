import { scaleLinear } from '@visx/scale'

import type { TrendPoint } from '../types/TrendPoint'

// Band centres on a shared scale, 4 px clear of the edges for the end dot.
export const trendPoints = (
  values: readonly (number | null)[],
  width: number,
  height: number,
  max: number,
): TrendPoint[] => {
  const step = width / Math.max(1, values.length)
  const y = scaleLinear<number>({
    domain: [0, Math.max(1, max)],
    range: [height - 4, 4],
  })
  return values.map((value, i) => ({
    x: step * i + step / 2,
    y: value === null ? null : y(value),
  }))
}
