import type { PendingView } from '@orbit/contract'

export type TodoSourceResult = {
  source: PendingView['sources'][number]
  items: PendingView['items']
}
