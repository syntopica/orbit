import type { LabelRect3d } from '../types/LabelRect3d'

export const rectsOverlap3d = (a: LabelRect3d, b: LabelRect3d): boolean =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height
