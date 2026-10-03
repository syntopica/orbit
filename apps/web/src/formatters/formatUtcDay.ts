export const formatUtcDay = (ms: number): string =>
  new Date(ms).toISOString().slice(0, 10)
