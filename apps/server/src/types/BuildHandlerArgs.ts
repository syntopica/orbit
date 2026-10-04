import type { EngineRunner } from './EngineRunner'
import type { Hub } from './Hub'
import type { OrbitState } from './OrbitState'

export type BuildHandlerArgs = [
  state: OrbitState,
  hub: Hub,
  webRoot: string,
  port: number,
  engines: Readonly<Record<string, EngineRunner>>,
  actionSignal?: AbortSignal,
]
