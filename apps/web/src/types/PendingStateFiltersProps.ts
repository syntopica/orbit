import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingStateFiltersProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
