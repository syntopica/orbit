// A count the contract bounds to a non-negative integer: anything else from
// the worker is blanked to null rather than failing the whole response.
export const countOrNull = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null
