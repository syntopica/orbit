import type { SnapshotCore } from '@orbit/contract'

import type { Adapter } from '../types/Adapter'
import type { Emitter } from '../types/Emitter'
import { raceAbort } from './raceAbort'

export const guardedRead = async (
  adapter: Adapter,
  emitter: Emitter,
  controller: AbortController,
  onResult: (result: PromiseSettledResult<SnapshotCore>) => void,
): Promise<void> => {
  const timeout = setTimeout(() => {
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
  await work.catch(() => undefined)
}
