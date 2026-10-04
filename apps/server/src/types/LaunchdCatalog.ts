import type { ComponentId } from '@orbit/contract'

import type { LaunchdSchedule } from './LaunchdSchedule'

export type LaunchdCatalog = {
  rows(signal: AbortSignal): Promise<
    {
      readonly component: ComponentId
      readonly label: string
      readonly role: 'scheduled' | 'keepalive'
      readonly actions?: readonly ('run' | 'restart')[]
      readonly schedule: LaunchdSchedule | null
    }[]
  >
}
