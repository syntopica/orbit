// A collapsed community grows with the square root of its page count, like
// a page with its degree, under a larger cap.
export const clusterSize = (pages: number): number =>
  Math.min(30, 4 + 2.5 * Math.sqrt(pages))
