import { atriumPassesSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'

// Codes, counts and instants only; refreshed with the atrium screen.
export const useAtriumPasses = () =>
  useQuery({
    queryKey: ['atrium-passes'],
    queryFn: async () => apiJson('/api/atrium/passes', atriumPassesSchema),
    refetchInterval: 60_000,
  })
