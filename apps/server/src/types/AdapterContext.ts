import type { EngineRunner } from './EngineRunner'
import type { LatestClipsDocuments } from './LatestClipsDocuments'
import type { LaunchdObservation } from './LaunchdObservation'
import type { OrbitConfig } from './OrbitConfig'
import type { RunRequest } from './RunRequest'
import type { RunResult } from './RunResult'

export type AdapterContext = {
  readonly config: OrbitConfig
  readonly stateDir: string
  readonly uid: number
  readonly record: (observation: LaunchdObservation) => void
  readonly run: (request: RunRequest) => Promise<RunResult>
  readonly fetch: typeof fetch
  readonly engines: Readonly<Record<string, EngineRunner>>
  readonly clipsLatest?: LatestClipsDocuments | undefined
}
