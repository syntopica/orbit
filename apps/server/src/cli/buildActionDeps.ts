import { runProcess } from '../process/runProcess'
import type { ActionDeps } from '../types/ActionDeps'
import type { EngineRunner } from '../types/EngineRunner'
import type { OrbitState } from '../types/OrbitState'

export const buildActionDeps = (
  state: OrbitState,
  runners: Readonly<Record<string, EngineRunner>>,
): ActionDeps => ({
  launchd: state.config.launchd,
  engines: state.config.engines,
  runners,
  run: runProcess,
  uid: process.getuid?.() ?? 0,
  env: state.env,
})
