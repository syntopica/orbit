import { NODE_SCALE_3D } from './nodeScale3d'

// A node's sphere radius in three.js units, as drawn and as laid out.
export const nodeRadius3d = (size: number): number => size * NODE_SCALE_3D
