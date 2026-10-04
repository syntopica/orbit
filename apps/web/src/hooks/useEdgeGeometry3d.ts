import { useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'

import { edgePositions3d } from '../geometry/edgePositions3d'
import type { Scene3dPartProps } from '../types/Scene3dPartProps'

// The edges as one line-segment geometry, rebuilt (and the old one freed)
// when the scene or the lit set changes.
export const useEdgeGeometry3d = ({
  scene,
  points,
  lit,
}: Scene3dPartProps): BufferGeometry => {
  const geometry = useMemo(() => {
    const built = new BufferGeometry()
    built.setAttribute(
      'position',
      new BufferAttribute(edgePositions3d(scene.edges, points, lit), 3),
    )
    return built
  }, [scene, points, lit])
  useEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  return geometry
}
