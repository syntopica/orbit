import type { SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { Emitter } from '../types/Emitter'
import type { Recorder } from '../types/Recorder'
import { downSnapshot } from './downSnapshot'
import { reasonOf } from './reasonOf'

export const createRecorder = (
  adapter: Adapter,
  emitter: Emitter,
): Recorder => {
  let failures = 0
  let lastGood: SnapshotCore | null = null
  return {
    failures: () => failures,
    reset: () => {
      failures = 0
    },
    record: (result) => {
      if (result.status === 'fulfilled') {
        lastGood = result.value
        failures = 0
        emitter.emit({ ...result.value, lastGood: null })
        return
      }
      failures += 1
      emitter.emit(downSnapshot(adapter.id, reasonOf(result.reason), lastGood))
    },
  }
}
