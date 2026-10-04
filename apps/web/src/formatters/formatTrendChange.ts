import { formatCount } from './formatCount'

// A signed change over the selected range; zero says so in words.
export const formatTrendChange = (change: number): string => {
  if (change === 0) return 'no change in range'
  const sign = change > 0 ? '+' : '−'
  return `${sign}${formatCount(Math.abs(change))} in range`
}
