import type { AtriumSyntheses } from '@orbit/contract'

import type { StackColumn } from '../types/StackColumn'

// Input under output, one column per UTC day.
export const selectTokenColumns = (
  daily: AtriumSyntheses['daily'],
): StackColumn[] =>
  daily.map(({ day, inputTokens, outputTokens }) => ({
    start: day,
    end: day + 86_400_000,
    segments: [
      { key: 'input', count: inputTokens },
      { key: 'output', count: outputTokens },
    ],
    total: inputTokens + outputTokens,
  }))
