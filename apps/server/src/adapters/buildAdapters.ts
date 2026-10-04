import { join } from 'node:path'

import type { Adapter } from '../types/Adapter'
import type { AdapterContext } from '../types/AdapterContext'
import { buildMemoryAdapters } from './buildMemoryAdapters'
import { buildPendingAdapters } from './buildPendingAdapters'
import { createLaunchdAdapter } from './launchd/createLaunchdAdapter'
import { createSyntheticAdapter } from './synthetic/createSyntheticAdapter'
import { createWorkerAdapter } from './worker/createWorkerAdapter'

export const buildAdapters = (context: AdapterContext): Adapter[] => {
  const { config } = context
  const adapters: Adapter[] = []
  const launchd = config.launchd
  if (launchd !== undefined && launchd.labels.length > 0) {
    adapters.push(
      createLaunchdAdapter({
        launchctl: launchd.launchctl,
        plutil: launchd.plutil,
        labels: launchd.labels,
        uid: context.uid,
        cadenceMs: config.cadenceMs.launchd ?? 10_000,
        run: context.run,
        record: context.record,
      }),
    )
  }
  if (config.worker !== undefined) {
    adapters.push(
      createWorkerAdapter({
        ...config.worker,
        cadenceMs: config.cadenceMs.worker ?? 5000,
        fetch: context.fetch,
      }),
    )
  }
  adapters.push(...buildMemoryAdapters(context))
  adapters.push(...buildPendingAdapters(context))
  if (config.synthetic)
    adapters.push(
      createSyntheticAdapter(
        join(context.stateDir, 'synthetic-fail'),
        config.cadenceMs.synthetic ?? 1000,
      ),
    )
  return adapters
}
