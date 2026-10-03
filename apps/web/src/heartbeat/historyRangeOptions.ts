import type { HistoryRange } from '../types/HistoryRange'
import type { RangeOption } from '../types/RangeOption'
import { HISTORY_RANGES } from './historyRanges'
import { RANGE_SPECS } from './rangeSpecs'

export const HISTORY_RANGE_OPTIONS: readonly RangeOption<HistoryRange>[] =
  HISTORY_RANGES.map((value) => ({ value, label: RANGE_SPECS[value].label }))
