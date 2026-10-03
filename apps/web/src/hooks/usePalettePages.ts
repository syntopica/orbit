import { brainGraphSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'

import { apiJson } from '../api/apiJson'
import type { PalettePagesState } from '../types/PalettePagesState'

// D14: the same query as the Brain screen, only while the palette is open.
export const usePalettePages = (open: boolean): PalettePagesState => {
  const query = useQuery({
    queryKey: ['brain', 'graph'],
    queryFn: async () => apiJson('/api/brain/graph', brainGraphSchema),
    enabled: open,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  return { ids: query.data?.nodes.map((node) => node.id) ?? [] }
}
