import type { WorkerNode } from '@orbit/contract'

import type { WorkerStatus } from '../types/WorkerStatus'
import { isIdentifier } from './isIdentifier'
import { toNodeRow } from './toNodeRow'

export const toNodeRows = (nodes: WorkerStatus['nodes']): WorkerNode[] =>
  Object.entries(nodes)
    .filter(([name]) => isIdentifier(name))
    .map(([name, report]) => toNodeRow(name, report))
    .toSorted((a, b) => a.name.localeCompare(b.name))
