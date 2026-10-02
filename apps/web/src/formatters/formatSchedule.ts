import type { LaunchdRow } from '../types/LaunchdRow'
import { formatDuration } from './formatDuration'

export const formatSchedule = (row: LaunchdRow): string => {
  const schedule = row.schedule
  if (schedule === null) return 'schedule unknown'
  if (schedule.calendar) return 'calendar'
  if (schedule.intervalS !== null) {
    return `every ${formatDuration(schedule.intervalS * 1000)}`
  }
  return schedule.keepAlive ? 'kept alive' : 'on demand'
}
