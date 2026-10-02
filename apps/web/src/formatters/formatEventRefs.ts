import type { OrbitEvent } from '@orbit/contract'

import { REASON_LABELS } from '../labels/reasonLabels'
import { EVENT_REF_ORDER } from './eventRefOrder'
import { formatRef } from './formatRef'

export const formatEventRefs = (event: OrbitEvent): string =>
  EVENT_REF_ORDER.flatMap((key) => {
    const value = event.refs[key]
    return value === undefined ? [] : [formatRef(key, value, REASON_LABELS)]
  }).join(' · ')
