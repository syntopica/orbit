import type { AtriumSynthesisRow } from '@orbit/contract'

import { formatCount } from './formatCount'

// "2 facts · 1 open end"
export const formatSynthesisResult = (row: AtriumSynthesisRow): string =>
  `${formatCount(row.facts)} ${row.facts === 1 ? 'fact' : 'facts'} · ${formatCount(row.openEnds)} ${row.openEnds === 1 ? 'open end' : 'open ends'}`
