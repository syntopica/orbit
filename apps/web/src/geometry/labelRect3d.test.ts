import { PerspectiveCamera, Sprite } from 'three'
import { describe, expect, it } from 'vitest'

import { CAMERA_FOV_3D } from './cameraFov3d'
import { labelRect3d } from './labelRect3d'

const camera = new PerspectiveCamera(CAMERA_FOV_3D, 2, 0.1, 100)
camera.position.set(0, 0, 10)
camera.lookAt(0, 0, 0)
camera.updateMatrixWorld()
const view = { width: 800, height: 400 }

describe('labelRect3d', () => {
  it('centres a label at the origin over the middle of the view', () => {
    const sprite = new Sprite()
    sprite.scale.set(0.2, 0.05, 1)
    const missing = { left: NaN, top: NaN, width: NaN, height: NaN }
    const rect = labelRect3d(sprite, camera, view) ?? missing
    // One world unit of sprite scale is half the view height over tan(fov/2).
    const unit = 200 / Math.tan((CAMERA_FOV_3D * Math.PI) / 360)
    expect(rect.height).toBeCloseTo(0.05 * unit)
    expect(rect.width).toBeCloseTo(0.2 * unit)
    expect(rect.left).toBeCloseTo(400 - rect.width / 2)
    expect(rect.top).toBeCloseTo(200 - rect.height)
  })
  it('has no box behind the camera', () => {
    const sprite = new Sprite()
    sprite.position.set(0, 0, 20)
    expect(labelRect3d(sprite, camera, view)).toBeNull()
  })
})
