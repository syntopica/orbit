import type { ComponentId, FlowStageId } from '@orbit/contract'

export type LabelEntry = {
  readonly component: ComponentId
  readonly label: string
  readonly role: 'scheduled' | 'keepalive'
  readonly stage?: FlowStageId | undefined
  readonly plist: string
}
