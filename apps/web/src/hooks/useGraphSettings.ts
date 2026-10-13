import { useMemo } from 'react'
import { sigmaOptions } from '../graph/sigmaOptions'
import type { GraphPalette } from '../types/GraphPalette'

export const useGraphSettings = (palette: GraphPalette) =>
  useMemo(() => sigmaOptions(palette), [palette])
