import type { Body3d } from '../types/Body3d'

// Moves each body along its shift, never further than `temperature`, and
// clears the shift for the next step.
export const moveBodies3d = (
  bodies: readonly Body3d[],
  temperature: number,
): void => {
  for (const body of bodies) {
    const length = Math.hypot(body.dx, body.dy, body.dz)
    const scale = length === 0 ? 0 : Math.min(length, temperature) / length
    body.x += body.dx * scale
    body.y += body.dy * scale
    body.z += body.dz * scale
    body.dx = 0
    body.dy = 0
    body.dz = 0
  }
}
