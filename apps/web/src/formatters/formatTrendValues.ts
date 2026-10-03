import type { TrendLine } from '../types/TrendLine'
import { formatTrendValue } from './formatTrendValue'

// The slider's value text: every line's number at one bucket.
export const formatTrendValues = (
  lines: readonly TrendLine[],
  index: number,
): string =>
  lines
    .map((line) => `${formatTrendValue(line.values[index])} ${line.label}`)
    .join(', ')
