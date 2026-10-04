export const SYSTEM_LABELS = {
  title: 'System',
  range: 'Range',
  loading: 'loading',
  historyUnavailable: 'history unavailable',
  allHealthy: 'all up',
  catalogFailed: 'Could not read the launchd catalog.',
  empty:
    'No launchd labels are registered. Add them to launchd.labels in orbit.json.',
  scheduleUnknown: 'schedule unknown',
  calendar: 'calendar',
  every: 'every',
  keptAlive: 'kept alive',
  onDemand: 'on demand',
  noReading: 'no reading yet',
  runningPid: 'running, pid',
  lastExit: 'last exit',
  neverExited: 'never exited',
} as const
