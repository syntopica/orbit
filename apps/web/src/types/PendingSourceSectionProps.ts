import type { PendingView } from '@orbit/contract'

export type PendingSourceSectionProps = {
  readonly source: PendingView['sources'][number]
  readonly items: PendingView['items']
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}
