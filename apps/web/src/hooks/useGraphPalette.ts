import { useMemo } from 'react'

import { readGraphPalette } from '../graph/readGraphPalette'
import type { GraphPalette } from '../types/GraphPalette'
import { useMediaQuery } from './useMediaQuery'

// Re-read when the colour scheme flips, so the canvas follows the theme.
export const useGraphPalette = (): GraphPalette => {
  const light = useMediaQuery('(prefers-color-scheme: light)')
  return useMemo(() => readGraphPalette(light ? 'light' : 'dark'), [light])
}
