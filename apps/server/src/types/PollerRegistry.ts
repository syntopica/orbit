import type { ComponentId, PollerRow } from '@orbit/contract'

import type { PollTracker } from './PollTracker'

export type PollerRegistry = {
  tracker(component: ComponentId): PollTracker
  rows(): PollerRow[]
}
