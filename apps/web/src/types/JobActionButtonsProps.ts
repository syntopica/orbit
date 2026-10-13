import type { useWorkerJobActions } from '../hooks/useWorkerJobActions'

export type JobActionButtonsProps = {
  readonly model: ReturnType<typeof useWorkerJobActions>
}
