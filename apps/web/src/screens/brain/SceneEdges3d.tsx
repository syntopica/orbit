import { useEdgeGeometry3d } from '../../hooks/useEdgeGeometry3d'
import type { Scene3dPartProps } from '../../types/Scene3dPartProps'

// Hairlines in the line colour; while a node is hovered only the edges among
// its neighbourhood show, in the accent colour.
export const SceneEdges3d = (props: Scene3dPartProps) => {
  const geometry = useEdgeGeometry3d(props)
  const { palette, lit } = props
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={lit === null ? palette.line : palette.accent} />
    </lineSegments>
  )
}
