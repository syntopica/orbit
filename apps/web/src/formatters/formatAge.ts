import { formatDuration } from './formatDuration'

export const formatAge = (iso: string, now: number): string =>
  formatDuration(now - Date.parse(iso))
