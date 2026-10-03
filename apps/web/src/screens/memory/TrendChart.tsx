import { TREND_HEIGHT } from '../../charts/trendHeight'
import { formatBucketRange } from '../../formatters/formatBucketRange'
import { formatTrendValues } from '../../formatters/formatTrendValues'
import { useChartWidth } from '../../hooks/useChartWidth'
import { useColumnFocus } from '../../hooks/useColumnFocus'
import type { TrendChartProps } from '../../types/TrendChartProps'
import { ChartSlider } from '../worker/ChartSlider'
import { ChartTooltip } from '../worker/ChartTooltip'
import { HitBands } from '../worker/HitBands'
import { TrendMarks } from './TrendMarks'
import { TrendTooltip } from './TrendTooltip'

// 2 px lines on one scale with a baseline; gaps are buckets orbit did not watch.
export const TrendChart = ({ label, model }: TrendChartProps) => {
  const { parentRef, width } = useChartWidth()
  const count = model.starts.length
  const focus = useColumnFocus(count)
  const step = width / Math.max(1, count)
  const index = focus.active ?? count - 1
  const start = model.starts[index] ?? 0
  const when = formatBucketRange(start, start + model.bucketMs)
  return (
    <div ref={parentRef} className="relative w-full">
      <ChartSlider
        label={label}
        count={count}
        valueText={`${formatTrendValues(model.lines, index)}, ${when}`}
        width={width}
        height={TREND_HEIGHT}
        focus={focus}
      >
        <TrendMarks model={model} width={width} active={focus.active} />
        <HitBands
          bands={model.starts.map((_, i) => ({ x: step * i, width: step }))}
          height={TREND_HEIGHT}
          onShow={focus.show}
        />
      </ChartSlider>
      {focus.active === null ? null : (
        <ChartTooltip left={step * focus.active + step / 2} top={0}>
          <TrendTooltip lines={model.lines} index={focus.active} when={when} />
        </ChartTooltip>
      )}
    </div>
  )
}
