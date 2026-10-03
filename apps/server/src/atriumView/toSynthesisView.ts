import type { AtriumView } from '@orbit/contract'

import type { AtriumDocuments } from '../types/AtriumDocuments'
import { identifierOrNull } from '../workerView/identifierOrNull'

export const toSynthesisView = (
  pass: NonNullable<AtriumDocuments['synthesis']>['lastPass'],
): NonNullable<AtriumView['synthesis']> => {
  const finishedAt = Date.parse(pass.finishedAt)
  return {
    finishedAt,
    durationMs: Math.max(0, finishedAt - Date.parse(pass.startedAt)),
    producer: identifierOrNull(pass.producer),
    conversations: pass.conversations,
    synthesized: pass.synthesized,
    skipped: pass.skipped,
    failed: pass.failed,
    deferred: pass.deferred,
  }
}
