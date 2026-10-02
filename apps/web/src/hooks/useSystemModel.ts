import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { apiJson } from '../api/apiJson'
import { launchdRowsSchema } from '../schemas/launchdRowsSchema'
import type { SystemModel } from '../types/SystemModel'
import { validateSystemSearch } from '../validators/validateSystemSearch'
import { useMediaQuery } from './useMediaQuery'

export const useSystemModel = (): SystemModel => {
  const { range } = validateSystemSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const query = useQuery({
    queryKey: ['launchd-rows'],
    queryFn: async () => apiJson('/api/launchd', launchdRowsSchema),
    refetchInterval: 60_000,
  })
  return {
    rows: query.data?.rows ?? null,
    failed: query.isError,
    range,
    setRange: (next) =>
      void navigate({ to: '/system', search: { range: next } }),
    isPhone,
  }
}
