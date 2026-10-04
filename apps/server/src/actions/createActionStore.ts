import { randomUUID } from 'node:crypto'

import type { ActionRun } from '../types/ActionRun'
import type { ActionStore } from '../types/ActionStore'
import type { Hub } from '../types/Hub'
import { executeActionRun } from './executeActionRun'
import { publishActionEvent } from './publishActionEvent'

export const createActionStore = (hub: Hub, now: () => number): ActionStore => {
  const active = new Map<
    string,
    { startedAt: number; controller: AbortController }
  >()
  const history: ActionRun[] = []
  return {
    start: (input) => {
      const busy = active.get(input.key)
      if (busy !== undefined) return { startedAt: busy.startedAt }
      const startedAt = now()
      const controller = new AbortController()
      active.set(input.key, { startedAt, controller })
      const started: ActionRun = {
        id: randomUUID(),
        kind: input.kind,
        target: input.target,
        state: 'started',
        startedAt,
        exitCode: -1,
        durationMs: 0,
      }
      history.unshift(started)
      history.splice(50)
      publishActionEvent(hub, now, started, input.component)
      void executeActionRun(input, controller.signal, started, {
        history,
        active,
        hub,
        now,
      })
      return { run: started }
    },
    list: () => [...history],
    stop: () => {
      for (const entry of active.values()) entry.controller.abort()
    },
  }
}
