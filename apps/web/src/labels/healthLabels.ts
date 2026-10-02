import type { CardState } from '../types/CardState'

export const HEALTH_LABELS: Record<CardState, string> = {
  ok: 'Healthy',
  warn: 'Degraded',
  down: 'Down',
}
