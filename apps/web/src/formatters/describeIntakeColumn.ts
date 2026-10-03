import { CLIPS_LABELS } from '../labels/clipsLabels'
import type { StackColumn } from '../types/StackColumn'
import { formatCount } from './formatCount'
import { formatUtcDay } from './formatUtcDay'

export const describeIntakeColumn = (column: StackColumn): string =>
  `${formatCount(column.total)} ${CLIPS_LABELS.captured}, ${formatUtcDay(column.start)}`
