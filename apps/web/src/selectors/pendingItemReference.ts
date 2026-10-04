import type { PendingView } from '@orbit/contract'

export const pendingItemReference = (item: PendingView['items'][number]) =>
  item.ref
