import type { useWorkerJobActions } from '../../hooks/useWorkerJobActions'

// Retry is the recovery and leads; acknowledge only clears the failure.
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
        className="bg-accent text-space rounded px-3 py-2 font-semibold"
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
    {model.ackable ? (
      <p className="text-muted basis-full text-xs">
        {model.retryable
          ? 'Retry runs a new job with the same input and acknowledges this one. '
          : ''}
        Acknowledge removes this failure from the outstanding count and the
        recent failures without running anything.
      </p>
    ) : null}
  </div>
)
