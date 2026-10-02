import type { DatabaseSync } from 'node:sqlite'

export type AuthRouteDeps = {
  readonly db: DatabaseSync
  readonly now: () => number
}
