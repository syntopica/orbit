import type { MemoryFlow } from '@orbit/contract'

import type { StageButtonProps } from './StageButtonProps'

export type StageListItemProps = StageButtonProps & {
  readonly flow: MemoryFlow | null
}
