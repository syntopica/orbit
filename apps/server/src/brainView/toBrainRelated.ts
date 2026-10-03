import type { BrainRelated } from '@orbit/contract'

import type { BrainRelatedDocument } from '../types/BrainRelatedDocument'
import { isPageId } from './isPageId'

export const toBrainRelated = (
  doc: BrainRelatedDocument,
  now: number,
): BrainRelated => ({
  now,
  total: doc.total,
  pairs: doc.pairs
    .filter(
      (pair) => isPageId(pair.left) && isPageId(pair.right) && pair.score >= 0,
    )
    .map(({ left, right, score }) => ({ left, right, score })),
})
