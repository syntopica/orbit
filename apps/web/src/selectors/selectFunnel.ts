import type { ClipsView } from '@orbit/contract'

import { FUNNEL_GROUPS } from '../charts/funnelGroups'
import { CLIPS_LABELS } from '../labels/clipsLabels'
import type { FunnelRow } from '../types/FunnelRow'
import { countFunnelGroup } from './countFunnelGroup'

export const selectFunnel = (view: ClipsView): FunnelRow[] => {
  const grouped = new Set(FUNNEL_GROUPS.flatMap((group) => group.states))
  return [
    ...FUNNEL_GROUPS.map((group) => ({
      id: group.id,
      label: CLIPS_LABELS.groups[group.id],
      count: countFunnelGroup(view, group.states),
      broken: group.id === 'broken',
    })),
    ...view.states
      .filter((s) => !grouped.has(s.state))
      .map((s) => ({
        id: s.state,
        label: s.state,
        count: s.count,
        broken: false,
      })),
  ]
}
