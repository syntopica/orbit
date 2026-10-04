import type { SnapshotCore } from '@orbit/contract'

import type { AtriumPassesDocument } from '../../types/AtriumPassesDocument'

// The newest pass that logged an exit: a time-boxed or killed one warns
// `pass_timeout`, any other failure `pass_failed`. A running pass is judged
// by the one before it; no pass log is no opinion.
export const synthesisPassHealth = (
  passes: AtriumPassesDocument | null,
): SnapshotCore['health'] | null => {
  const ended = passes?.passes.find((pass) => pass.exitCode !== null)
  if (ended === undefined) return null
  if (ended.state === 'timeout' || ended.state === 'killed')
    return { state: 'warn', reason: 'pass_timeout' }
  if (ended.state === 'failed') return { state: 'warn', reason: 'pass_failed' }
  return null
}
