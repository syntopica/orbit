// D8: area grows with degree, capped so hubs never hide their neighbours.
export const nodeSize = (degree: number): number =>
  Math.min(16, 2 + 1.5 * Math.sqrt(degree))
