import type { EngineRunner } from './EngineRunner'
import type { OrbitConfig } from './OrbitConfig'
import type { RunRequest } from './RunRequest'
import type { RunResult } from './RunResult'

export type ActionDeps = {
  readonly launchd: OrbitConfig['launchd']
  readonly engines: OrbitConfig['engines']
  readonly runners: Readonly<Record<string, EngineRunner>>
  readonly run: (request: RunRequest) => Promise<RunResult>
  readonly uid: number
  readonly env: NodeJS.ProcessEnv
}
