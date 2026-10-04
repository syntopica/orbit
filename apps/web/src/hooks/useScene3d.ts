import { useMemo, useState } from 'react'

import { sceneExtent3d } from '../geometry/sceneExtent3d'
import { layoutScene3d } from '../layout/layoutScene3d'
import { litNodes } from '../selectors/litNodes'
import { sceneNeighbours } from '../selectors/sceneNeighbours'
import type { GraphPalette } from '../types/GraphPalette'
import type { GraphScene } from '../types/GraphScene'
import type { Scene3dState } from '../types/Scene3dState'

// The layout runs once per scene; hovering only changes the lit set.
export const useScene3d = (
  scene: GraphScene,
  palette: GraphPalette,
): Scene3dState => {
  const points = useMemo(() => layoutScene3d(scene), [scene])
  const neighbours = useMemo(() => sceneNeighbours(scene), [scene])
  const [hovered, setHovered] = useState<string | null>(null)
  const lit = useMemo(
    () => litNodes(neighbours, hovered),
    [neighbours, hovered],
  )
  const part = useMemo(
    () => ({ scene, points, palette, lit }),
    [scene, points, palette, lit],
  )
  const extent = useMemo(() => sceneExtent3d(scene, points), [scene, points])
  return { part, extent, hover: setHovered }
}
