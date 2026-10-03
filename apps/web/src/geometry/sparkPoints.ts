import { scaleLinear } from '@visx/scale'

import type { SparkPoint } from '../types/SparkPoint'

// Points at band centres, 4 px clear of the top and bottom for the end dot.
export const sparkPoints = (
  values: readonly number[],
  width: number,
  height: number,
): SparkPoint[] => {
  const step = width / Math.max(1, values.length)
  const y = scaleLinear<number>({
    domain: [0, Math.max(1, ...values)],
    range: [height - 4, 4],
  })
  return values.map((value, i) => ({ x: step * i + step / 2, y: y(value) }))
}
