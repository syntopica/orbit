import type { PendingView } from '@orbit/contract'

export type PendingFileRefProps = {
  readonly reference: Extract<PendingView['items'][number]['ref'], object>
}
