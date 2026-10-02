import { COMPONENT_IDS } from '@orbit/contract'

import { COMPONENT_LABELS } from '../labels/componentLabels'
import { REASON_LABELS } from '../labels/reasonLabels'
import type { CardModel } from '../types/CardModel'
import type { StreamState } from '../types/StreamState'
import { selectHeadline } from './selectHeadline'

export const selectCards = (snapshots: StreamState['snapshots']): CardModel[] =>
  COMPONENT_IDS.flatMap((id) => {
    const snapshot = snapshots[id]
    if (snapshot === undefined) return []
    const lastGood = snapshot.health.state === 'down' ? snapshot.lastGood : null
    const source = lastGood ?? snapshot
    return [
      {
        component: id,
        label: COMPONENT_LABELS[id],
        state: snapshot.health.state,
        reason:
          snapshot.health.reason === null
            ? null
            : REASON_LABELS[snapshot.health.reason],
        headline: selectHeadline(source),
        observedAt: source.observedAt,
        greyed: lastGood !== null,
      },
    ]
  })
