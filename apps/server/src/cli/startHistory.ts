import type { DatabaseSync } from 'node:sqlite'

import { pruneHistory } from '../history/pruneHistory'
import { recordMetrics } from '../history/recordMetrics'
import { startRun } from '../history/startRun'
import { touchRun } from '../history/touchRun'
import type { Hub } from '../types/Hub'
import { swallowErrors } from './swallowErrors'

// Records metrics from snapshots, keeps the run row fresh and prunes hourly.
// Returns the stop function.
export const startHistory = (db: DatabaseSync, hub: Hub): (() => void) => {
  const unsubscribe = hub.subscribe((message) => {
    if (message.type === 'snapshot') recordMetrics(db, message.snapshot)
  })
  const run = startRun(db, Date.now())
  pruneHistory(db, Date.now())
  const touch = setInterval(
    swallowErrors(() => {
      touchRun(db, run, Date.now())
    }),
    60_000,
  )
  const prune = setInterval(
    swallowErrors(() => {
      pruneHistory(db, Date.now())
    }),
    3_600_000,
  )
  return () => {
    clearInterval(touch)
    clearInterval(prune)
    unsubscribe()
    touchRun(db, run, Date.now())
  }
}
