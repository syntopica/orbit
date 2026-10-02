import type { LaunchdObservation } from './LaunchdObservation'

export type LaunchdHistory = {
  readonly observations: LaunchdObservation[]
  readonly runs: { readonly started: number; readonly stopped: number }[]
}
