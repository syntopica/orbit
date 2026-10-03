import type { FlowStageId } from '@orbit/contract'

import type { Ref } from 'react'

import type { FlowStage } from './FlowStage'

export type StageButtonProps = {
  readonly buttonRef?: Ref<HTMLButtonElement>
  readonly stage: FlowStage
  readonly selected: boolean
  readonly onSelect: (id: FlowStageId | null) => void
}
