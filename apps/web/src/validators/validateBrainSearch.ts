import { pageIdSchema } from '@orbit/contract'
import { z } from 'zod'

import type { BrainSearch } from '../types/BrainSearch'
import { readGraphDepth } from './readGraphDepth'

// Invalid values fall back to defaults; a page id outside the pattern is
// dropped, so it never reaches the page route.
export const validateBrainSearch = (
  search: Record<string, unknown>,
): BrainSearch => {
  const page = pageIdSchema.safeParse(search['page'])
  const hide = z.array(z.unknown()).safeParse(search['hide'])
  const range = search['range']
  return {
    ...(page.success ? { page: page.data } : {}),
    depth: readGraphDepth(search['depth']),
    color: search['color'] === 'community' ? 'community' : 'type',
    orphans: search['orphans'] !== false,
    hide: hide.success
      ? hide.data.filter((type): type is string => typeof type === 'string')
      : [],
    range: range === '7d' || range === '30d' ? range : '24h',
  }
}
