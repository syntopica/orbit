import { atriumViewSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import { ATRIUM_TREND_SPECS } from '../charts/atriumTrendSpecs'
import type { AtriumModel } from '../types/AtriumModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'
import { useTrend } from './useTrend'

export const useAtriumModel = (): AtriumModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['atrium'],
    queryFn: async () => apiJson('/api/atrium', atriumViewSchema),
    refetchInterval: 60_000,
  })
  const view = query.data ?? null
  return {
    view,
    failed: query.isError,
    staleAgeMs:
      query.isError && view !== null
        ? query.errorUpdatedAt - query.dataUpdatedAt
        : null,
    isPhone,
    trend: useTrend('atrium', range, ATRIUM_TREND_SPECS),
    range,
    setRange: (next) =>
      void navigate({ to: '/atrium', search: { range: next } }),
  }
}
