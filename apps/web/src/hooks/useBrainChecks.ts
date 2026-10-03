import { brainChecksSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { BrainChecksState } from '../types/BrainChecksState'

// D5: loaded with the screen, never polled; issue page ids are content.
export const useBrainChecks = (): BrainChecksState => {
  const query = useQuery({
    queryKey: ['brain', 'checks'],
    queryFn: async () => apiJson('/api/brain/checks', brainChecksSchema),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return { checks: query.data ?? null, failed: query.isError }
}
