import { useOrbitControls3d } from '../../hooks/useOrbitControls3d'
import type { SceneControls3dProps } from '../../types/SceneControls3dProps'

export const SceneControls3d = ({ extent }: SceneControls3dProps) => {
  useOrbitControls3d(extent)
  return null
}
