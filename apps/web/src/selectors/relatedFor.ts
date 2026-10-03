import type { BrainRelated } from '@orbit/contract'

import { pairInvolves } from './pairInvolves'

// D6: the selected page's pairs first; the engine's score order otherwise.
export const relatedFor = (
  pairs: BrainRelated['pairs'],
  id: string | null,
): BrainRelated['pairs'] => {
  return [
    ...pairs.filter((pair) => pairInvolves(pair, id)),
    ...pairs.filter((pair) => !pairInvolves(pair, id)),
  ]
}
