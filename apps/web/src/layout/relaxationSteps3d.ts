// Pair repulsion is quadratic: big scenes take fewer steps, never under 10.
export const relaxationSteps3d = (count: number): number =>
  Math.max(10, Math.min(120, Math.round(2e7 / Math.max(1, count * count))))
