import { createLaunchdCatalog } from '../adapters/launchd/createLaunchdCatalog'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { runProcess } from '../process/runProcess'
import type { OrbitState } from '../types/OrbitState'

export const buildLaunchdCatalog = (state: OrbitState) => {
  const launchd = state.config.launchd
  if (launchd === undefined) return null
  return createLaunchdCatalog({
    ...launchd,
    uid: process.getuid?.() ?? 0,
    cadenceMs: state.config.cadenceMs.launchd ?? 10_000,
    run: runProcess,
    record: (observation) => {
      recordLaunchdObservation(state.historyDb, observation)
    },
  })
}
