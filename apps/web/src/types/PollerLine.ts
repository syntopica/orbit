import type { ComponentId } from '@orbit/contract'

export type PollerLine = {
  readonly component: ComponentId
  readonly state: 'ok' | 'reading' | 'failing' | 'overdue' | 'waiting'
  readonly detail: string
}
