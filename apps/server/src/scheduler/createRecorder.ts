import type { SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { Emitter } from '../types/Emitter'
import type { PollTracker } from '../types/PollTracker'
import type { Recorder } from '../types/Recorder'
import { downSnapshot } from './downSnapshot'
import { noopTracker } from './noopTracker'
import { reasonOf } from './reasonOf'

export const createRecorder = (
  adapter: Adapter,
  emitter: Emitter,
  track: PollTracker = noopTracker,
): Recorder => {
  let failures = 0
  let lastGood: SnapshotCore | null = null
  return {
    failures: () => failures,
    reset: () => {
      failures = 0
    },
    record: (result) => {
      track.settle(result.status === 'fulfilled')
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
