import { GRAPH_SERIES_FALLBACKS } from '../charts/graphSeriesFallbacks'
import type { GraphPalette } from '../types/GraphPalette'
import { readGraphToken } from './readGraphToken'

// WebGL needs colour values, so the theme tokens (spec 7.1) are read from the
// document; the fallbacks are the dark theme's values.
export const readGraphPalette = (scheme: 'light' | 'dark'): GraphPalette => {
  const style = getComputedStyle(document.documentElement)
  return {
    scheme,
    series: GRAPH_SERIES_FALLBACKS.map((fallback, index) =>
      readGraphToken(style, `--color-series-${String(index + 1)}`, fallback),
    ),
    warn: readGraphToken(style, '--color-warn', '#fbbf24'),
    accent: readGraphToken(style, '--color-accent', '#6ee7ff'),
    line: readGraphToken(style, '--color-line', '#1c2536'),
    ink: readGraphToken(style, '--color-ink', '#e6edf7'),
  }
}
