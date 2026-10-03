import type { AtriumView } from '@orbit/contract'

import { isIdentifier } from '../workerView/isIdentifier'

// Largest source first; a source name that is not an identifier is dropped.
export const toSourceRows = (
  bySource: Readonly<Record<string, number>>,
): AtriumView['records']['bySource'] =>
  Object.entries(bySource)
    .filter(([source]) => isIdentifier(source))
    .map(([source, count]) => ({ source, count }))
    .toSorted((a, b) => b.count - a.count || a.source.localeCompare(b.source))
