import { TREND_HEIGHT } from '../../charts/trendHeight'
import { trendPoints } from '../../geometry/trendPoints'
import type { TrendMarksProps } from '../../types/TrendMarksProps'
import { SparkPath } from '../worker/SparkPath'

export const TrendMarks = ({ model, width, active }: TrendMarksProps) => {
  const max = Math.max(
    1,
    ...model.lines.flatMap((line) => line.values.map((v) => v ?? 0)),
  )
  return (
    <>
      <line
        x1={0}
        x2={width}
        y1={TREND_HEIGHT - 4}
        y2={TREND_HEIGHT - 4}
        className="stroke-line"
        shapeRendering="crispEdges"
      />
      {model.lines.map((line) => (
        <SparkPath
          key={line.key}
          points={trendPoints(line.values, width, TREND_HEIGHT, max)}
          active={active}
          stroke={line.stroke}
          dot={line.dot}
        />
      ))}
    </>
  )
}
