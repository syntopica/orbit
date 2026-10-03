import { LinePath } from '@visx/shape'

import type { SparkPathProps } from '../../types/SparkPathProps'

// 2 px line, round joins; the shown bucket gets an 8 px dot with a surface ring.
export const SparkPath = ({ points, active, stroke, dot }: SparkPathProps) => {
  const point = points[active ?? -1]
  return (
    <>
      <LinePath
        data={[...points]}
        x={(p) => p.x}
        y={(p) => p.y}
        className={stroke}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {point === undefined ? null : (
        <circle
          cx={point.x}
          cy={point.y}
          r={4}
          strokeWidth={2}
          className={`stroke-panel ${dot}`}
        />
      )}
    </>
  )
}
