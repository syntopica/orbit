import { Link } from '@tanstack/react-router'
import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useWorkerActivity } from '../../hooks/useWorkerActivity'
import { useWorkerModel } from '../../hooks/useWorkerModel'
import { WORKER_LABELS } from '../../labels/workerLabels'
import { WorkerBody } from './WorkerBody'

export const WorkerScreen = () => {
  const model = useWorkerModel()
  const activity = useWorkerActivity()
  return (
    <main className="mx-auto max-w-7xl space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {WORKER_LABELS.title}
        </h1>
        <Link to="/worker/jobs" className="text-accent underline">
          Jobs
        </Link>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? <p role="alert">{WORKER_LABELS.unavailable}</p> : null}
      {model.body === null && !model.failed && (
        <p className="text-muted">{WORKER_LABELS.loading}</p>
      )}
      {model.body !== null && (
        <WorkerBody
          body={model.body}
          isPhone={model.isPhone}
          activity={activity}
        />
      )}
    </main>
  )
}
