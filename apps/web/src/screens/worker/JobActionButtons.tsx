import type { useWorkerJobActions } from '../../hooks/useWorkerJobActions'

export const JobActionButtons = ({
  model,
}: {
  model: ReturnType<typeof useWorkerJobActions>
}) => (
  <div className="flex flex-wrap gap-3">
    {model.cancelable ? (
      <button
        type="button"
        onClick={model.selectCancel}
        className="border-line rounded border px-3 py-2"
      >
        Cancel job
      </button>
    ) : null}
    {model.retryable ? (
      <button
        type="button"
        onClick={model.selectRetry}
        className="border-line rounded border px-3 py-2"
      >
        Retry job
      </button>
    ) : null}
    {model.ackable ? (
      <button
        type="button"
        onClick={model.selectAck}
        className="border-line rounded border px-3 py-2"
      >
        Acknowledge job
      </button>
    ) : null}
  </div>
)
