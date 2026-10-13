import type { PollerLine } from './PollerLine'

export type PollerState = {
  readonly lines: PollerLine[] | null
  readonly failed: boolean
}
