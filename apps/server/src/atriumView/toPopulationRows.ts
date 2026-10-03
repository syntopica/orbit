import type { AtriumView } from '@orbit/contract'

import type { AtriumDocuments } from '../types/AtriumDocuments'
import { isIdentifier } from '../workerView/isIdentifier'

export const toPopulationRows = (
  populations: AtriumDocuments['refresh']['populations'],
): AtriumView['populations'] =>
  populations
    .filter((p) => isIdentifier(p.model))
    .map(({ model, intended, indexed }) => ({ model, intended, indexed }))
