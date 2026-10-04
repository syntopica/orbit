import { useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'
import type { InstancedMesh } from 'three'
import { Color, Matrix4 } from 'three'

import { nodeRadius3d } from '../geometry/nodeRadius3d'
import type { Scene3dPartProps } from '../types/Scene3dPartProps'

// One instanced sphere per node: placed and sized from the 3D layout,
// coloured like 2D, faded towards the line colour when not lit.
export const useSceneInstances3d = ({
  scene,
  points,
  palette,
  lit,
}: Scene3dPartProps): RefObject<InstancedMesh | null> => {
  const mesh = useRef<InstancedMesh>(null)
  const invalidate = useThree((state) => state.invalidate)
  useLayoutEffect(() => {
    const current = mesh.current
    if (current === null) return
    const matrix = new Matrix4()
    const color = new Color()
    const faded = new Color(palette.line)
    scene.nodes.forEach((node, index) => {
      const [x, y, z] = points.get(node.id) ?? [0, 0, 0]
      const radius = nodeRadius3d(node.size)
      current.setMatrixAt(
        index,
        matrix.makeScale(radius, radius, radius).setPosition(x, y, z),
      )
      color.set(node.color)
      if (lit !== null && !lit.has(node.id)) color.lerp(faded, 0.8)
      current.setColorAt(index, color)
    })
    current.instanceMatrix.needsUpdate = true
    if (current.instanceColor !== null) current.instanceColor.needsUpdate = true
    current.computeBoundingSphere()
    invalidate()
  }, [scene, points, palette, lit, invalidate])
  return mesh
}
