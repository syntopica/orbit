import { type ComponentId, metricHistorySchema } from '@orbit/contract'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import { selectTrend } from '../selectors/selectTrend'
import type { HistoryRange } from '../types/HistoryRange'
import type { TrendSpec } from '../types/TrendSpec'
import type { TrendState } from '../types/TrendState'

export const useTrend = (
  component: ComponentId,
  range: HistoryRange,
  specs: readonly TrendSpec[],
): TrendState => {
  const query = useQuery({
    queryKey: ['metric-history', component, range],
    queryFn: async () =>
      selectTrend(
        await apiJson(
          `/api/history/metrics?component=${component}&range=${range}`,
          metricHistorySchema,
        ),
        range,
        specs,
      ),
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  })
  const model = query.data ?? null
  return {
    model,
    stale: query.isPlaceholderData,
    failed: query.isError && model === null,
  }
}
