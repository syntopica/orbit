import { useMemo } from 'react'
import { sigmaSettings } from '../graph/sigmaSettings'
import type { GraphPalette } from '../types/GraphPalette'

export const useGraphSettings = (palette: GraphPalette) =>
  useMemo(() => sigmaSettings(palette), [palette])
