import type { SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { Emitter } from '../types/Emitter'
import { raceAbort } from './raceAbort'
import { settleWithin } from './settleWithin'

export const guardedRead = async (
  adapter: Adapter,
  emitter: Emitter,
  controller: AbortController,
  onResult: (result: PromiseSettledResult<SnapshotCore>) => void,
): Promise<void> => {
  const timedOut = { value: false }
  const timeout = setTimeout(() => {
    timedOut.value = true
    controller.abort()
  }, adapter.timeoutMs)
  const lag = setTimeout(() => {
    emitter.degrade('lagging')
  }, adapter.cadenceMs)
  const work = adapter.read(controller.signal)
  try {
    const value = await raceAbort(work, controller.signal)
    onResult({ status: 'fulfilled', value })
  } catch (reason: unknown) {
    onResult({ status: 'rejected', reason })
  } finally {
    clearTimeout(timeout)
    clearTimeout(lag)
  }
  // A read abandoned by its timeout gets a bounded wait so the loop keeps
  // polling; one aborted by stop() is awaited so a restart never overlaps it.
  if (timedOut.value) await settleWithin(work, adapter.timeoutMs * 10)
  else await work.catch(() => undefined)
}
