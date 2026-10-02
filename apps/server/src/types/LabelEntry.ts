import type { ComponentId } from '@orbit/contract'

export type LabelEntry = {
  readonly component: ComponentId
  readonly label: string
  readonly role: 'scheduled' | 'keepalive'
  readonly plist: string
}
