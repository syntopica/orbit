import type { LabelReading } from '../../types/LabelReading'

export const isLabelFailing = (reading: LabelReading): boolean => {
  if (reading.state === null) return true
  if (reading.entry.role === 'keepalive') return reading.state.pid === null
  return (
    reading.state.pid === null &&
    reading.state.lastExit !== null &&
    reading.state.lastExit !== 0
  )
}
