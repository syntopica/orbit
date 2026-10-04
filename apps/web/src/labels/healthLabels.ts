import type { CardState } from '../types/CardState'

export const HEALTH_LABELS: Record<CardState, string> = {
  ok: 'Up',
  warn: 'Degraded',
  down: 'Down',
}
