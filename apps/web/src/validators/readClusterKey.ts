// A community key from the layout: a whole number, -1 for loose pages.
export const readClusterKey = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= -1
    ? value
    : null
