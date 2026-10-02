import type { SystemSearch } from '../types/SystemSearch'

export const validateSystemSearch = (
  search: Record<string, unknown>,
): SystemSearch => {
  const range = search['range']
  return { range: range === '7d' || range === '30d' ? range : '24h' }
}
