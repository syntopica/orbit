import type { OrbitEvent } from '@orbit/contract'

export const EVENT_LABELS: Record<OrbitEvent['kind'], string> = {
  'component.down': 'went down',
  'component.recovered': 'recovered',
  'launchd.exit_changed': 'job exit status changed',
  'launchd.started': 'job started',
  'launchd.stopped': 'job stopped',
  'worker.job_failed': 'job failed',
  'worker.cooldown_started': 'executor cooling down',
  'synthetic.tick': 'probe tick',
}
