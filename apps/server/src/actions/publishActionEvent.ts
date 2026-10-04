import type { ActionRun } from '../types/ActionRun'
import type { Hub } from '../types/Hub'

export const publishActionEvent = (
  hub: Hub,
  now: () => number,
  run: ActionRun,
  component: 'launchd' | 'brain' | 'clips',
): void => {
  hub.publishEvent({
    at: new Date(now()).toISOString(),
    component,
    kind: `action.${run.state}`,
    severity: run.state === 'failed' ? 'error' : 'info',
    refs: {
      id: run.id,
      kind: run.kind,
      target: run.target,
      exitCode: run.exitCode,
      durationMs: run.durationMs,
    },
  })
}
