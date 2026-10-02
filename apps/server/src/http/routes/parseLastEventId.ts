// Only a non-negative integer string is a stream position; anything else is
// treated as absent, so the client gets a full opening rather than nothing.
export const parseLastEventId = (header: string | undefined): number | null => {
  if (header === undefined || !/^\d{1,15}$/.test(header)) return null
  return Number(header)
}
