import { buildAdapters } from '../adapters/buildAdapters'
import { recordLaunchdObservation } from '../history/recordLaunchdObservation'
import { runProcess } from '../process/runProcess'
import { createScheduler } from '../scheduler/createScheduler'
import type { EngineRunner } from '../types/EngineRunner'
import type { Hub } from '../types/Hub'
import type { LoopHandle } from '../types/LoopHandle'
import type { OrbitState } from '../types/OrbitState'
import type { PollerRegistry } from '../types/PollerRegistry'

export const buildScheduler = (
  state: OrbitState,
  hub: Hub,
  engines: Readonly<Record<string, EngineRunner>>,
  poller?: PollerRegistry,
): LoopHandle =>
  createScheduler(
    buildAdapters({
      config: state.config,
      stateDir: state.stateDir,
      uid: process.getuid?.() ?? 0,
      record: (observation) => {
        recordLaunchdObservation(state.historyDb, observation)
      },
      run: runProcess,
      fetch,
      engines,
      clipsLatest: state.clipsLatest,
    }),
    hub,
    poller,
  )
