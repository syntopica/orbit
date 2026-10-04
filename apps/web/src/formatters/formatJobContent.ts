// One content pane's text: JSON pretty-printed, a plain string as it is.
// Null when the payload is not stored (never sent or already deleted).
export const formatJobContent = (value: unknown): string | null => {
  if (value === undefined || value === null) return null
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
}
