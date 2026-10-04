import type { AtriumSyntheses } from '@orbit/contract'

import type { AtriumRecentDocument } from '../types/AtriumRecentDocument'
import { toSynthesisRow } from './toSynthesisRow'

// Days arrive as UTC dates; the view carries each as its midnight in ms.
export const toSynthesesView = (
  doc: AtriumRecentDocument,
  now: number,
): AtriumSyntheses => ({
  now,
  records: doc.records,
  rows: doc.recent.flatMap((record) => toSynthesisRow(record) ?? []),
  daily: doc.daily.map(({ day, ...counts }) => ({
    day: Date.parse(`${day}T00:00:00Z`),
    ...counts,
  })),
})
