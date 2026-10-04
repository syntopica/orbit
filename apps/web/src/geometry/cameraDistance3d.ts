import { CAMERA_FOV_3D } from './cameraFov3d'

// How far the camera stands for a sphere of `extent` to fill the view
// height with a small margin.
export const cameraDistance3d = (extent: number): number =>
  (1.1 * extent) / Math.sin((CAMERA_FOV_3D * Math.PI) / 360)
