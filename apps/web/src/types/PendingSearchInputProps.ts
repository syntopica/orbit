import type { usePendingBoard } from '../hooks/usePendingBoard'

export type PendingSearchInputProps = {
  readonly model: ReturnType<typeof usePendingBoard>
}
