export const todoState = (
  marker: string,
): 'open' | 'partial' | 'blocked' | null => {
  if (marker === ' ') return 'open'
  if (marker === '~') return 'partial'
  if (marker === '!') return 'blocked'
  return null
}
