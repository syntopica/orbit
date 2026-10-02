import type { LaunchdRow } from '../types/LaunchdRow'

export const ROLE_LABELS: Record<LaunchdRow['role'], string> = {
  scheduled: 'scheduled',
  keepalive: 'kept alive',
}
