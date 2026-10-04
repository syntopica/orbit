import type { ReasonCode } from '@orbit/contract'

export const REASON_LABELS: Record<ReasonCode, string> = {
  stale: 'No fresh reading',
  timeout: 'Read timed out',
  exit_nonzero: 'Probe command failed',
  output_too_large: 'Probe output too large',
  schema_invalid: 'Unreadable answer',
  engine_schema_unsupported: 'Engine version not supported',
  not_found: 'Not found',
  unauthorized: 'Not authorized',
  unreachable: 'Unreachable',
  lagging: 'Reads are slow',
  check_failed: 'Health check failed',
  permission_denied: 'Permission denied',
  backlog: 'Backlog past its limit',
}
