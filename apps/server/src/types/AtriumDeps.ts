import type { AtriumReader } from './AtriumReader'

export type AtriumDeps = {
  readonly read: AtriumReader
  readonly refreshIntervalMs: number
}
