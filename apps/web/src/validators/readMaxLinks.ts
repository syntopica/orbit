// A hub cap is a positive whole number of links; anything else turns it off.
export const readMaxLinks = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null
