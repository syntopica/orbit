import type { Body3d } from '../types/Body3d'
import { repelPair3d } from './repelPair3d'

// Every pair of bodies pushes apart; quadratic, so callers bound the steps.
export const repelBodies3d = (bodies: readonly Body3d[]): void => {
  bodies.forEach((a, index) => {
    for (const b of bodies.slice(index + 1)) repelPair3d(a, b)
  })
}
