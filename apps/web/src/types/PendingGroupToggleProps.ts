import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingGroupToggleProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
