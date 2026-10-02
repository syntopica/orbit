import { COMPONENT_IDS, type ComponentId } from '@orbit/contract'

import type { StreamState } from '../types/StreamState'

export const selectNewlyDown = (
  previous: StreamState['snapshots'],
  next: StreamState['snapshots'],
): ComponentId[] =>
  COMPONENT_IDS.filter(
    (id) =>
      next[id]?.health.state === 'down' &&
      previous[id]?.health.state !== 'down',
  )
