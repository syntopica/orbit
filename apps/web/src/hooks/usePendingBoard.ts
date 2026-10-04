import { pendingViewSchema } from '@orbit/contract'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'

import { apiJson } from '../api/apiJson'
import { filterPendingItems } from '../selectors/filterPendingItems'
import { validatePendingSearch } from '../validators/validatePendingSearch'

export const usePendingBoard = () => {
  const filters = validatePendingSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['pending-board'],
    queryFn: async () => apiJson('/api/pending', pendingViewSchema),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: false,
  })
  useEffect(
    () => () => {
      client.removeQueries({ queryKey: ['pending-board'], exact: true })
    },
    [client],
  )
  const select = (key: 'state' | 'source' | 'q', value: string) => {
    const next = {
      ...filters,
      [key]: value === filters[key] ? undefined : value,
    }
    void navigate({
      to: '/pending',
      search: validatePendingSearch(next),
      replace: true,
    })
  }
  return {
    query,
    filters,
    select,
    items: filterPendingItems(query.data?.items ?? [], filters),
  }
}
