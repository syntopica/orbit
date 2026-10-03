import { SPARKLINE_HEIGHT } from '../../charts/sparklineHeight'
import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatCount } from '../../formatters/formatCount'
import { useSparkline } from '../../hooks/useSparkline'
import type { SparklineProps } from '../../types/SparklineProps'
import { ChartSlider } from './ChartSlider'
import { ChartTooltip } from './ChartTooltip'
import { HitBands } from './HitBands'
import { SparkPath } from './SparkPath'

// A 2 px line; hover, tap or arrow keys show one bucket's value.
export const Sparkline = (props: SparklineProps) => {
  const { starts, values, bucketMs, unit } = props
  const { parentRef, width, step, points, focus } = useSparkline(
    values,
    SPARKLINE_HEIGHT,
  )
  const index = focus.active ?? values.length - 1
  const start = starts[index] ?? 0
  const when = formatBucketRange(start, start + bucketMs)
  const value = formatCount(values[index] ?? 0)
  const point = points[focus.active ?? -1]
  return (
    <div ref={parentRef} className="relative w-full">
      <ChartSlider
        label={props.label}
        count={values.length}
        valueText={`${value} ${unit}, ${when}`}
        width={width}
        height={SPARKLINE_HEIGHT}
        focus={focus}
      >
        <SparkPath
          points={points}
          active={focus.active}
          stroke={props.stroke}
          dot={props.dot}
        />
        <HitBands
          bands={points.map((p) => ({ x: p.x - step / 2, width: step }))}
          height={SPARKLINE_HEIGHT}
          onShow={focus.show}
        />
      </ChartSlider>
      {point === undefined ? null : (
        <ChartTooltip left={point.x} top={0}>
          <span className="whitespace-nowrap">
            <strong className="text-ink font-semibold">{value}</strong>{' '}
            <span className="text-muted">
              {unit} · {when}
            </span>
          </span>
        </ChartTooltip>
      )}
    </div>
  )
}
