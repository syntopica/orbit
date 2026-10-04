import type { PollerView } from '@orbit/contract'

import { formatPollerDetail } from '../formatters/formatPollerDetail'
import type { PollerLine } from '../types/PollerLine'
import { pollerState } from './pollerState'

export const describePollerRows = (view: PollerView): PollerLine[] =>
  view.rows.map((row) => ({
    component: row.component,
    state: pollerState(row, view.now),
    detail: formatPollerDetail(row, view.now),
  }))
