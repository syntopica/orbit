import type { PendingView } from '@orbit/contract'

export type PendingSectionListProps = {
  readonly section: string | null
  readonly items: PendingView['items']
}
