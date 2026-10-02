import { SYSTEM_LABELS } from '../labels/systemLabels'
import type { LaunchdRow } from '../types/LaunchdRow'
import { formatDuration } from './formatDuration'

export const formatSchedule = (row: LaunchdRow): string => {
  const schedule = row.schedule
  if (schedule === null) return SYSTEM_LABELS.scheduleUnknown
  if (schedule.calendar) return SYSTEM_LABELS.calendar
  if (schedule.intervalS !== null) {
    return `${SYSTEM_LABELS.every} ${formatDuration(schedule.intervalS * 1000)}`
  }
  return schedule.keepAlive ? SYSTEM_LABELS.keptAlive : SYSTEM_LABELS.onDemand
}
