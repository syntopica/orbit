import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { fetchSynthesisContent } from '../api/fetchSynthesisContent'

// Fetched only after the operator asks, held by no cache once the row
// closes or the screen unmounts (spec 6.6).
export const useSynthesisContent = (jobKey: string) => {
  const client = useQueryClient()
  const [revealed, setRevealed] = useState(false)
  useEffect(
    () => () => {
      client.removeQueries({ queryKey: ['atrium-synthesis', jobKey] })
    },
    [client, jobKey],
  )
  const query = useQuery({
    queryKey: ['atrium-synthesis', jobKey],
    queryFn: async ({ signal }) => fetchSynthesisContent(jobKey, signal),
    enabled: revealed,
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  })
  return {
    revealed,
    reveal: () => {
      setRevealed(true)
    },
    conceal: () => {
      setRevealed(false)
      client.removeQueries({ queryKey: ['atrium-synthesis', jobKey] })
    },
    query,
  }
}
