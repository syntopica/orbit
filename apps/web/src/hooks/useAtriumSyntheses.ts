import { atriumSynthesesSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'

// A detail call that costs atrium seconds: fetched when the screen opens,
// never polled (spec 7.4); the server holds it five minutes.
export const useAtriumSyntheses = () =>
  useQuery({
    queryKey: ['atrium-syntheses'],
    queryFn: async () =>
      apiJson('/api/atrium/syntheses', atriumSynthesesSchema),
    staleTime: 300_000,
    refetchOnWindowFocus: false,
  })
