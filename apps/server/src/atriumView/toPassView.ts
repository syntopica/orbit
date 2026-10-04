import type { AtriumPass } from '@orbit/contract'

import { epochOrNull } from '../time/epochOrNull'
import type { AtriumPassDocument } from '../types/AtriumPassDocument'
import { identifierOrNull } from '../workerView/identifierOrNull'

export const toPassView = (pass: AtriumPassDocument): AtriumPass => ({
  lane: identifierOrNull(pass.lane),
  producer: identifierOrNull(pass.producer),
  model: identifierOrNull(pass.model),
  startedAt: epochOrNull(pass.startedAt),
  finishedAt: epochOrNull(pass.finishedAt),
  durationMs: pass.durationS === null ? null : pass.durationS * 1000,
  exitCode: pass.exitCode,
  state: pass.state,
  synthesized: pass.synthesized,
  skipped: pass.skipped,
  failed: pass.failed,
  deferred: pass.deferred,
})
