import type { useWorkerJobsScreen } from '../hooks/useWorkerJobsScreen'

export type WorkerJobsListProps = {
  readonly model: ReturnType<typeof useWorkerJobsScreen>
}
