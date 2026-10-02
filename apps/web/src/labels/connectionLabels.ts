import type { StreamStatus } from '../types/StreamStatus'

export const CONNECTION_LABELS: Record<StreamStatus, string> = {
  connecting: 'Connecting',
  live: 'Live',
  stale: 'Stale',
  offline: 'Offline',
  unauthorized: 'Signed out',
}
