import { ProcessError } from '../../process/ProcessError'
import type { LabelReading } from '../../types/LabelReading'

export const assertSomeReadable = (readings: readonly LabelReading[]): void => {
  const first = readings[0]?.error
  if (first != null && readings.every((r) => r.error !== null))
    throw new ProcessError(first)
}
