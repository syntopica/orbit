import type { HistoryRange } from '../types/HistoryRange'
import type { RangeSpec } from '../types/RangeSpec'

export const RANGE_SPECS: Record<HistoryRange, RangeSpec> = {
  '24h': { spanMs: 86_400_000, buckets: 48, label: '24 hours' },
  '7d': { spanMs: 7 * 86_400_000, buckets: 84, label: '7 days' },
  '30d': { spanMs: 30 * 86_400_000, buckets: 90, label: '30 days' },
}
