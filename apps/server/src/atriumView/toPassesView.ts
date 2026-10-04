import type { AtriumPasses } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { AtriumPassesDocument } from '../types/AtriumPassesDocument'
import { toPassView } from './toPassView'

export const toPassesView = (
  doc: AtriumPassesDocument,
  now: number,
): AtriumPasses => ({
  now,
  lastPass: doc.lastPass === null ? null : toPassView(doc.lastPass),
  unsuccessfulStreak: doc.unsuccessfulStreak,
  progress:
    doc.progress === null
      ? null
      : { ...doc.progress, updatedAt: epochOrNull(doc.progress.updatedAt) },
  passes: doc.passes.map(toPassView),
})
