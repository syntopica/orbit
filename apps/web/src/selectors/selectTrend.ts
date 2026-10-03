import type { MetricHistory } from '@orbit/contract'

import { trendSlot } from '../charts/trendSlot'
import type { HistoryRange } from '../types/HistoryRange'
import type { TrendModel } from '../types/TrendModel'
import type { TrendSpec } from '../types/TrendSpec'
import { bucketSeries } from './bucketSeries'
import { rangeStarts } from './rangeStarts'

export const selectTrend = (
  history: MetricHistory,
  range: HistoryRange,
  specs: readonly TrendSpec[],
): TrendModel => {
  const { starts, bucketMs } = rangeStarts(history.now, range)
  return {
    starts,
    bucketMs,
    lines: specs.map((spec, i) => ({
      ...spec,
      ...trendSlot(i),
      values: bucketSeries(
        history.series.find((s) => s.key === spec.key)?.points ?? [],
        history.runs,
        starts,
        bucketMs,
      ),
    })),
  }
}
