import { brainRelatedSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { BrainRelatedState } from '../types/BrainRelatedState'

// D5: scored only when asked; the server caches one answer per cadence.
export const useBrainRelated = (enabled: boolean): BrainRelatedState => {
  const query = useQuery({
    queryKey: ['brain', 'related'],
    queryFn: async () => apiJson('/api/brain/related', brainRelatedSchema),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return {
    related: query.data ?? null,
    loading: enabled && query.isPending,
    failed: query.isError,
  }
}
