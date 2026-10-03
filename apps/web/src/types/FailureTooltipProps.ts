import type { StackColumn } from './StackColumn'

export type FailureTooltipProps = {
  readonly column: StackColumn
  readonly keys: Readonly<Record<string, string>>
}
