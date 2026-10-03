import type { SnapshotCore } from '@orbit/contract'
import type { z } from 'zod'

import type { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { clipsPending } from './clipsPending'
import type { clipsStatusSchema } from './clipsStatusSchema'

export const summarizeClips = (
  status: z.infer<typeof clipsStatusSchema>,
  doctor: z.infer<typeof doctorDocumentSchema>,
  now: Date,
): Pick<SnapshotCore, 'health' | 'metrics' | 'pending'> => {
  const at = now.toISOString()
  const state = (name: string): number => status.states[name] ?? 0
  const today = at.slice(0, 10)
  const intake = status.intake.days.find((d) => d.day === today)?.count ?? 0
  const broken = state('inconsistent') + state('unreadable') > 0
  return {
    health:
      !doctor.ok || broken
        ? { state: 'warn', reason: 'check_failed' }
        : { state: 'ok', reason: null },
    metrics: [
      { key: 'clips.total', value: status.total, at },
      { key: 'clips.pending', value: state('pending'), at },
      { key: 'clips.needs_claude', value: state('needs-claude'), at },
      { key: 'clips.intake_today', value: intake, at },
    ],
    pending: clipsPending(status),
  }
}
