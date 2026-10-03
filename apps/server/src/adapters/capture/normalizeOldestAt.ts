// The capture service returns the client's own timestamp, offset intact; orbit
// publishes the UTC instant, or null when the text is not a date at all.
export const normalizeOldestAt = (value: string | null): string | null => {
  if (value === null) return null
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : new Date(ms).toISOString()
}
