import type { Point } from '../types/Point'

export const orbitPosition = (
  index: number,
  total: number,
  radius: number,
): Point => {
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2
  return {
    x: Math.round(Math.cos(angle) * radius * 1000) / 1000,
    y: Math.round(Math.sin(angle) * radius * 1000) / 1000,
  }
}
