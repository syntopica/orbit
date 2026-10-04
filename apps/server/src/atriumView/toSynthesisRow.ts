import type { AtriumSynthesisRow } from '@orbit/contract'
import { synthesisJobKeySchema } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { AtriumRecordDocument } from '../types/AtriumRecordDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'

// A row whose key is not a registry key is dropped: the key is what the
// reveal route is asked for. Other names that fail the check are blanked.
export const toSynthesisRow = (
  record: AtriumRecordDocument,
): AtriumSynthesisRow | null => {
  if (!synthesisJobKeySchema.safeParse(record.jobKey).success) return null
  return {
    jobKey: record.jobKey,
    kind: record.kind,
    source: identifierOrNull(record.source),
    conversationId: identifierOrNull(record.conversationId),
    episodeId: identifierOrNull(record.episodeId),
    eventCount: record.eventCount,
    sessionSince: epochOrNull(record.session?.since),
    sessionUntil: epochOrNull(record.session?.until),
    authoredAt: epochOrNull(record.authoredAt),
    writtenAt: Date.parse(record.writtenAt),
    modelRequested: identifierOrNull(record.modelRequested),
    modelResolved: identifierOrNull(record.modelResolved),
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    durationMs: record.durationMs,
    mapChunks: record.mapChunks ?? null,
    workerResults: record.workerResults,
    facts: record.facts,
    openEnds: record.openEnds,
  }
}
