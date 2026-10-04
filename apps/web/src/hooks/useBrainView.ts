import { brainGraphSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { apiJson } from '../api/apiJson'
import { toSceneGraph } from '../graph/toSceneGraph'
import { buildGraphModel } from '../selectors/buildGraphModel'
import { pageIndex } from '../selectors/pageIndex'
import { resolveFocus } from '../selectors/resolveFocus'
import { selectViewCaption } from '../selectors/selectViewCaption'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainView } from '../types/BrainView'
import { useBrainScene } from './useBrainScene'
import { useGraphLayout } from './useGraphLayout'
import { useGraphPalette } from './useGraphPalette'
import { useLastPage } from './useLastPage'

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
  const remembered = useLastPage(search.page)
  const page = search.page
  const focus = model === null ? null : resolveFocus(model, page, remembered)
  const scene = useBrainScene({ model, layout, search, palette, focus })
  const graph = useMemo(
    () => (scene === null ? null : toSceneGraph(scene, palette)),
    [scene, palette],
  )
  return {
    data,
    model,
    scene,
    graph,
    selected: pageIndex(model, page),
    focus,
    palette,
    communities: layout === null ? 0 : new Set(layout.community).size,
    caption: selectViewCaption(search.depth, model, focus, scene),
    failed: query.isError && data === null,
    layoutFailed,
  }
}
