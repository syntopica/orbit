import type { DatabaseSync } from 'node:sqlite'

import type { InstanceConfig } from './InstanceConfig'
import type { LatestClipsDocuments } from './LatestClipsDocuments'
import type { OrbitConfig } from './OrbitConfig'

export type OrbitState = {
  readonly dataDir: string
  readonly stateDir: string
  readonly config: OrbitConfig
  readonly instance: InstanceConfig
  readonly env: NodeJS.ProcessEnv
  readonly authDb: DatabaseSync
  readonly historyDb: DatabaseSync
  // In memory for the process only: shared by the clips adapter and the
  // routes that read what it last polled.
  readonly clipsLatest: LatestClipsDocuments
  close(): void
}
