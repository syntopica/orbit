import type { AppDeps } from '../types/AppDeps'
import type { DetailPool } from '../types/DetailPool'
import type { PendingSourceResult } from '../types/PendingSourceResult'
import { readBrainPending } from './readBrainPending'
import { readClipsPending } from './readClipsPending'
import { readTodoSource } from './readTodoSource'
import { readWorkerPending } from './readWorkerPending'
import { runLocalSource } from './runLocalSource'
import { runPendingSource } from './runPendingSource'

export const collectPendingSources = async (
  deps: AppDeps,
  pool: DetailPool,
  now: number,
): Promise<PendingSourceResult[]> => {
  const tasks = (deps.todoFiles ?? []).map(
    async (file) =>
      await runLocalSource(
        async (signal) => await readTodoSource(file, signal),
        { id: `todo:${file.name}`, kind: 'todo', name: file.name },
      ),
  )
  const brain = deps.brain
  if (brain !== null)
    tasks.push(
      runPendingSource(
        pool,
        async (signal) => await readBrainPending(brain, signal),
        { id: 'brain', kind: 'brain', name: 'Brain lint' },
      ),
    )
  const worker = deps.workerJobs
  if (worker !== null)
    tasks.push(
      runPendingSource(
        pool,
        async (signal) => await readWorkerPending(worker, signal, now),
        { id: 'worker', kind: 'worker', name: 'Worker failures' },
      ),
    )
  if (deps.clips !== null)
    tasks.push(
      runLocalSource(
        () =>
          readClipsPending(
            deps.hub.snapshots().find((row) => row.component === 'clips'),
            now,
          ),
        { id: 'clips', kind: 'clips', name: 'Clips waiting' },
      ),
    )
  return await Promise.all(tasks)
}
