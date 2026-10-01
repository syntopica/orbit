export const backoffDelay = (cadenceMs: number, failures: number): number =>
  Math.min(cadenceMs * 2 ** failures, cadenceMs * 10)
