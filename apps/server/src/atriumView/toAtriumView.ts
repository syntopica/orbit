import type { AtriumView } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { AtriumDocuments } from '../types/AtriumDocuments'
import { toPopulationRows } from './toPopulationRows'
import { toSourceRows } from './toSourceRows'
import { toSynthesisView } from './toSynthesisView'

export const toAtriumView = (
  { refresh, synthesis }: AtriumDocuments,
  refreshIntervalMs: number,
  now: number,
): AtriumView => ({
  now,
  writtenAt: Date.parse(refresh.writtenAt),
  refreshIntervalMs,
  records: {
    total: refresh.records.total,
    bySource: toSourceRows(refresh.records.bySource),
  },
  archiveAt: epochOrNull(refresh.archive.at),
  refreshAt: epochOrNull(refresh.refresh.at),
  contentAt: epochOrNull(refresh.content.at),
  populations: toPopulationRows(refresh.populations),
  synthesis: synthesis === null ? null : toSynthesisView(synthesis.lastPass),
})
