import type { Pending } from '@orbit/contract'

export const PENDING_LABELS: Record<Pending['key'], string> = {
  'launchd.failing_jobs': 'failing jobs',
  'worker.failed_jobs': 'failed jobs',
  'worker.queued_jobs': 'queued jobs',
  'atrium.not_indexed': 'records not indexed',
  'brain.lint_issues': 'lint issues',
  'clips.pending': 'clips pending',
  'clips.needs_claude': 'clips needing review',
  'capture.undrained': 'captures waiting',
  'pending.open': 'open TODOs',
  'pending.partial': 'partial TODOs',
  'pending.blocked': 'blocked TODOs',
  'synthetic.items': 'probe items',
}
