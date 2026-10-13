import type { PendingView } from '@orbit/contract'

export type PendingItemRowProps = {
  readonly item: PendingView['items'][number]
}
