import {
  COMPONENT_IDS,
  EVENT_KINDS,
  METRIC_KEYS,
  PENDING_KEYS,
  REASON_CODES,
} from '@orbit/contract'
import { describe, expect, it } from 'vitest'

import { COMPONENT_LABELS } from './componentLabels'
import { CONNECTION_LABELS } from './connectionLabels'
import { EVENT_LABELS } from './eventLabels'
import { METRIC_LABELS } from './metricLabels'
import { PENDING_LABELS } from './pendingLabels'
import { REASON_LABELS } from './reasonLabels'

describe('labels', () => {
  it.each([
    [COMPONENT_IDS, COMPONENT_LABELS],
    [REASON_CODES, REASON_LABELS],
    [EVENT_KINDS, EVENT_LABELS],
    [METRIC_KEYS, METRIC_LABELS],
    [PENDING_KEYS, PENDING_LABELS],
    [
      ['connecting', 'live', 'stale', 'offline', 'unauthorized'],
      CONNECTION_LABELS,
    ],
  ] as const)('names every id', (ids, labels) => {
    for (const id of ids)
      expect((labels as Record<string, string>)[id]?.length).toBeGreaterThan(0)
  })
})
