import type { StreamMessage } from '@orbit/contract'

export type Ring = {
  push(message: StreamMessage): void
  after(id: number): StreamMessage[] | null
}
