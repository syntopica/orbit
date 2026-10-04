import type { PendingView } from '@orbit/contract'

export type PendingSourceResult = {
  source: PendingView['sources'][number]
  items: PendingView['items']
}
