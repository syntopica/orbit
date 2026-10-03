import { pageIdSchema } from '@orbit/contract'

import type { BrainSearch } from '../types/BrainSearch'
import { readGraphDepth } from './readGraphDepth'

// Invalid values fall back to defaults; a page id outside the pattern is
// dropped, so it never reaches the page route.
export const validateBrainSearch = (
  search: Record<string, unknown>,
): BrainSearch => {
  const page = pageIdSchema.safeParse(search['page'])
  const hide = search['hide']
  const range = search['range']
  return {
    ...(page.success ? { page: page.data } : {}),
    depth: readGraphDepth(search['depth']),
    color: search['color'] === 'community' ? 'community' : 'type',
    orphans: search['orphans'] !== false,
    hide: Array.isArray(hide)
      ? hide.filter((type): type is string => typeof type === 'string')
      : [],
    range: range === '7d' || range === '30d' ? range : '24h',
  }
}
