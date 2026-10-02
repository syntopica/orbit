import { READING_LABELS } from '../labels/readingLabels'
import { formatAge } from './formatAge'

export const formatReadingAge = (observedAt: string, now: number): string =>
  `${READING_LABELS.lastReading} ${formatAge(observedAt, now)}`
