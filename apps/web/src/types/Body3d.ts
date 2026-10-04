// A node during the 3D relaxation: its position and the shift summed for
// the current step. Mutable on purpose: the loop updates it in place.
export type Body3d = {
  x: number
  y: number
  z: number
  dx: number
  dy: number
  dz: number
}
