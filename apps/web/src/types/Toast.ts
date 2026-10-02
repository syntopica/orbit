import type { ComponentId, ReasonCode } from '@orbit/contract'

export type Toast = {
  readonly id: string
  readonly component: ComponentId
  readonly reason: ReasonCode | null
}
