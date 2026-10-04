// An amount the contract bounds to a finite non-negative number (US dollars):
// anything else from the worker is blanked to null.
export const amountOrNull = (
  value: number | null | undefined,
): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null
