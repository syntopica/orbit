import type { LaunchdRow } from './LaunchdRow'

export type LaunchdRowGroup = {
  readonly component: LaunchdRow['component']
  readonly rows: LaunchdRow[]
}
