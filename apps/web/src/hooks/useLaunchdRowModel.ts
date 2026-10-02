import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { SYSTEM_LABELS } from '../labels/systemLabels'
import { launchdHistorySchema } from '../schemas/launchdHistorySchema'
import { selectRowModel } from '../selectors/selectRowModel'
import type { HistoryRange } from '../types/HistoryRange'
import type { LaunchdRow } from '../types/LaunchdRow'
import type { LaunchdRowModel } from '../types/LaunchdRowModel'
import { useNow } from './useNow'

export const useLaunchdRowModel = (
  row: LaunchdRow,
  range: HistoryRange,
): LaunchdRowModel => {
  const now = useNow(60_000)
  const query = useQuery({
    queryKey: ['launchd-history', row.label, range],
    queryFn: async () =>
      apiJson(
        `/api/launchd/history?label=${encodeURIComponent(row.label)}&range=${range}`,
        launchdHistorySchema,
      ),
    refetchInterval: 60_000,
  })
  return useMemo(() => {
    if (query.data === undefined) {
      const state = query.isError
        ? SYSTEM_LABELS.historyUnavailable
        : SYSTEM_LABELS.loading
      return { buckets: null, state, summary: '' }
    }
    return selectRowModel(query.data, row, range, now)
  }, [query.data, query.isError, row, range, now])
}
