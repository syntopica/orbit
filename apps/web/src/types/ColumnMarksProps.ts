import type { ColumnLayout } from './ColumnLayout'

export type ColumnMarksProps = {
  readonly column: ColumnLayout
  readonly fills: Readonly<Record<string, string>>
  readonly dimmed: boolean
}
