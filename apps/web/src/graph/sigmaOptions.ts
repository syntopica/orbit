import type { GraphPalette } from '../types/GraphPalette'
import type { GraphSigmaOptions } from '../types/GraphSigmaOptions'
import { sigmaSettings } from './sigmaSettings'
import { sigmaStyles } from './sigmaStyles'

export const sigmaOptions = (palette: GraphPalette): GraphSigmaOptions => ({
  settings: sigmaSettings(),
  styles: sigmaStyles(palette),
})
