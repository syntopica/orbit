import { randomUUID } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'

import type { ActionRun } from '../types/ActionRun'
import type { ActionStore } from '../types/ActionStore'
import type { Hub } from '../types/Hub'
import type { LiveActionRun } from '../types/LiveActionRun'
import { ensureActionRunsTable } from './ensureActionRunsTable'
import { executeActionRun } from './executeActionRun'
import { loadActionRuns } from './loadActionRuns'
import { markInterruptedRuns } from './markInterruptedRuns'
import { publishActionEvent } from './publishActionEvent'
import { saveActionRun } from './saveActionRun'

export const createActionStore = (
  hub: Hub,
  now: () => number,
  db: DatabaseSync,
): ActionStore => {
  ensureActionRunsTable(db)
  markInterruptedRuns(db)
  const save = (run: ActionRun): void => {
    saveActionRun(db, run)
  }
  const active = new Map<
    string,
    { startedAt: number; controller: AbortController }
  >()
  const history: ActionRun[] = loadActionRuns(db)
  return {
    start: (input) => {
      const busy = active.get(input.key)
      if (busy !== undefined) return { startedAt: busy.startedAt }
      const startedAt = now()
      const controller = new AbortController()
      active.set(input.key, { startedAt, controller })
      const started: LiveActionRun = {
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
      save(started)
      publishActionEvent(hub, now, started, input.component)
      void executeActionRun(input, controller.signal, started, {
        history,
        active,
        hub,
        now,
        save,
      })
      return { run: started }
    },
    list: () => [...history],
    stop: () => {
      for (const entry of active.values()) entry.controller.abort()
    },
  }
}
