import type { CountEntry } from '../types/CountEntry'
import { formatCount } from './formatCount'

export const formatCounts = (entries: readonly CountEntry[]): string =>
  entries.length === 0
    ? 'none'
    : entries.map((e) => `${e.key} ${formatCount(e.count)}`).join(' · ')
