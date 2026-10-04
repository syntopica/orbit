import { LABEL_HEIGHT_3D } from '../../geometry/labelHeight3d'
import { useLabelTexture } from '../../hooks/useLabelTexture'
import type { SceneLabel3dProps } from '../../types/SceneLabel3dProps'

export const SceneLabel3d = ({ text, color, position }: SceneLabel3dProps) => {
  const label = useLabelTexture(text, color)
  const [x, y, z] = position
  return (
    <sprite
      position={[x, y, z]}
      scale={[LABEL_HEIGHT_3D * label.aspect, LABEL_HEIGHT_3D, 1]}
    >
      <spriteMaterial map={label.texture} transparent depthWrite={false} />
    </sprite>
  )
}
