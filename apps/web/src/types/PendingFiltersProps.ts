import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingFiltersProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
