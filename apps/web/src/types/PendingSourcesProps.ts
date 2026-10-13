import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingSourcesProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
