import type { ExecutorRow } from './ExecutorRow'

export type ExecutorListProps = {
  readonly rows: readonly ExecutorRow[]
  readonly now: number
}
