// One link is a hairline; links folded between two communities thicken
// with the logarithm of their count.
export const edgeSize = (links: number): number =>
  Math.min(6, Math.max(1, Math.log2(links)))
