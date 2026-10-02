import { useDownToasts } from '../../hooks/useDownToasts'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import { REASON_LABELS } from '../../labels/reasonLabels'

export const Toasts = () => {
  const { toasts, dismiss } = useDownToasts()
  return (
    <div className="fixed right-4 bottom-20 z-50 flex w-80 flex-col gap-2 md:bottom-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className="border-down/40 bg-panel flex items-start justify-between gap-3 rounded-xl border p-3 text-sm"
        >
          <span>
            {COMPONENT_LABELS[toast.component]} is down
            {toast.reason !== null && (
              <span className="text-muted block">
                {REASON_LABELS[toast.reason]}
              </span>
            )}
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              dismiss(toast.id)
            }}
            className="text-muted"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
