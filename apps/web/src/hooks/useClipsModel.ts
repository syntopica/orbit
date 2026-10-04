import { clipsViewSchema } from '@orbit/contract'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

import { apiJson } from '../api/apiJson'
import { CLIPS_TREND_SPECS } from '../charts/clipsTrendSpecs'
import type { ClipsModel } from '../types/ClipsModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'
import { useTrend } from './useTrend'

export const useClipsModel = (): ClipsModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['clips'],
    queryFn: async () => apiJson('/api/clips', clipsViewSchema),
    refetchInterval: 60_000,
    gcTime: 0,
  })
  // The view carries brain page ids (content, spec 6.6): never kept past the
  // screen.
  useEffect(
    () => () => {
      client.removeQueries({ queryKey: ['clips'], exact: true })
    },
    [client],
  )
  const view = query.data ?? null
  return {
    view,
    failed: query.isError,
    staleAgeMs:
      query.isError && view !== null
        ? query.errorUpdatedAt - query.dataUpdatedAt
        : null,
    isPhone,
    trend: useTrend('clips', range, CLIPS_TREND_SPECS),
    range,
    setRange: (next) =>
      void navigate({ to: '/clips', search: { range: next } }),
  }
}
