import { brainPageSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { ApiError } from '../api/ApiError'
import { apiJson } from '../api/apiJson'
import type { BrainPageState } from '../types/BrainPageState'

// Content (spec 6.6): fetched on selection, dropped when the screen unmounts.
export const useBrainPage = (id: string | undefined): BrainPageState => {
  const query = useQuery({
    queryKey: ['brain', 'page', id],
    queryFn: async () =>
      apiJson(
        `/api/brain/page?id=${encodeURIComponent(id ?? '')}`,
        brainPageSchema,
      ),
    enabled: id !== undefined,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const missing = query.error instanceof ApiError && query.error.status === 404
  return {
    page: query.data ?? null,
    loading: id !== undefined && query.isPending,
    missing,
    failed: query.isError && !missing,
  }
}
