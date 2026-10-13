import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingSourceFiltersProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
