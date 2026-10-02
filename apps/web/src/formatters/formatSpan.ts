import { SPAN_UNITS } from './spanUnits'

// The two largest non-zero units: "4d 10h", "3h", "12m 5s".
export const formatSpan = (ms: number): string => {
  let rest = Math.max(0, Math.floor(ms / 1000) * 1000)
  const parts: string[] = []
  for (const [unit, size] of SPAN_UNITS) {
    const amount = Math.floor(rest / size)
    rest -= amount * size
    if (amount > 0 || parts.length > 0) parts.push(`${String(amount)}${unit}`)
  }
  const shown = parts.slice(0, 2).filter((part) => !part.startsWith('0'))
  return shown.length === 0 ? '0s' : shown.join(' ')
}
