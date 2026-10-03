import type { DatabaseSync } from 'node:sqlite'

import type { InstanceConfig } from './InstanceConfig'
import type { OrbitConfig } from './OrbitConfig'

export type OrbitState = {
  readonly dataDir: string
  readonly stateDir: string
  readonly config: OrbitConfig
  readonly instance: InstanceConfig
  readonly env: NodeJS.ProcessEnv
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  close(): void
}
