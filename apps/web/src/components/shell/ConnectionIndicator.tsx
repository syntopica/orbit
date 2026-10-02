import { useStream } from '../../hooks/useStream'
import { CONNECTION_LABELS } from '../../labels/connectionLabels'

export const ConnectionIndicator = () => {
  const { status } = useStream()
  return (
    <div
      role="status"
      aria-label="Connection"
      className="text-muted flex items-center gap-2 text-xs"
    >
      <span
        aria-hidden="true"
        data-status={status}
        className="bg-unknown data-[status=live]:bg-ok data-[status=offline]:bg-down data-[status=stale]:bg-warn size-2 rounded-full"
      />
      {CONNECTION_LABELS[status]}
    </div>
  )
}
