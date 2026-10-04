import type { Camera, Object3D } from 'three'
import { Vector3 } from 'three'

import type { LabelRect3d } from '../types/LabelRect3d'
import { CAMERA_FOV_3D } from './cameraFov3d'

// The screen box of a label sprite anchored at its bottom centre and drawn
// without perspective, or null when it sits behind the camera.
export const labelRect3d = (
  sprite: Object3D,
  camera: Camera,
  view: { readonly width: number; readonly height: number },
): LabelRect3d | null => {
  const ndc = new Vector3().copy(sprite.position).project(camera)
  if (ndc.z > 1) return null
  const unit = view.height / (2 * Math.tan((CAMERA_FOV_3D * Math.PI) / 360))
  const width = sprite.scale.x * unit
  const height = sprite.scale.y * unit
  return {
    left: ((ndc.x + 1) / 2) * view.width - width / 2,
    top: ((1 - ndc.y) / 2) * view.height - height,
    width,
    height,
  }
}
