import { nodeRadius3d } from '../../geometry/nodeRadius3d'
import { useLabelCulling3d } from '../../hooks/useLabelCulling3d'
import { labelledNodes3d } from '../../selectors/labelledNodes3d'
import type { Scene3dPartProps } from '../../types/Scene3dPartProps'
import { SceneLabel3d } from './SceneLabel3d'

// Labels sit on top of their sphere, face the camera and keep one size on
// screen; one that would cover a larger node's label is hidden.
export const SceneLabels3d = ({
  scene,
  points,
  palette,
  lit,
}: Scene3dPartProps) => {
  const group = useLabelCulling3d()
  return (
    <group ref={group}>
      {labelledNodes3d(scene.nodes, lit).map((node) => {
        const [x, y, z] = points.get(node.id) ?? [0, 0, 0]
        return (
          <SceneLabel3d
            key={node.id}
            text={node.label}
            color={palette.ink}
            position={[x, y + nodeRadius3d(node.size), z]}
          />
        )
      })}
    </group>
  )
}
