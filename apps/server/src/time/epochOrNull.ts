// An ISO instant as epoch ms; null when absent or unparseable.
export const epochOrNull = (iso: string | null | undefined): number | null => {
  if (iso === null || iso === undefined) return null
  const at = Date.parse(iso)
  return Number.isNaN(at) ? null : at
}
