import type { WorkerJobDetail } from '@orbit/contract'
import type { DatabaseSync } from 'node:sqlite'

export type RevealPermissionInput = {
  readonly job: WorkerJobDetail
  readonly header: string | undefined
  readonly db: DatabaseSync
  readonly session: string
  readonly now: number
}
