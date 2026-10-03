import { brainGraphSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { buildGraphModel } from '../selectors/buildGraphModel'
import { selectBrainGraph } from '../selectors/selectBrainGraph'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainView } from '../types/BrainView'
import { useGraphLayout } from './useGraphLayout'
import { useGraphPalette } from './useGraphPalette'

// D5: fetched when the screen opens, never polled, dropped on unmount.
export const useBrainView = (search: BrainSearch): BrainView => {
  const query = useQuery({
    queryKey: ['brain', 'graph'],
    queryFn: async () => apiJson('/api/brain/graph', brainGraphSchema),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
  const data = query.data ?? null
  const model = useMemo(
    () => (data === null ? null : buildGraphModel(data)),
    [data],
  )
  const { layout, failed: layoutFailed } = useGraphLayout(model)
  const palette = useGraphPalette()
  const page = search.page
  const selected =
    model === null || page === undefined
      ? null
      : (model.indexOf.get(page) ?? null)
  const graph = useMemo(
    () =>
      model === null || layout === null
        ? null
        : selectBrainGraph(model, layout, search, palette),
    [model, layout, search, palette],
  )
  return {
    data,
    model,
    graph,
    selected,
    palette,
    communities: layout === null ? 0 : new Set(layout.community).size,
    failed: query.isError && data === null,
    layoutFailed,
  }
}
