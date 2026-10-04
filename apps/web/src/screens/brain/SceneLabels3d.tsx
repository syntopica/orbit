import { NODE_SCALE_3D } from '../../geometry/nodeScale3d'
import { labelledNodes3d } from '../../selectors/labelledNodes3d'
import type { Scene3dPartProps } from '../../types/Scene3dPartProps'
import { SceneLabel3d } from './SceneLabel3d'

// Labels float just above their sphere and always face the camera.
export const SceneLabels3d = ({
  scene,
  points,
  palette,
  lit,
}: Scene3dPartProps) =>
  labelledNodes3d(scene.nodes, lit).map((node) => {
    const [x, y, z] = points.get(node.id) ?? [0, 0, 0]
    return (
      <SceneLabel3d
        key={node.id}
        text={node.label}
        color={palette.ink}
        position={[x, y + node.size * NODE_SCALE_3D + 0.5, z]}
      />
    )
  })
