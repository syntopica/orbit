import type { ConfirmJobButtonsProps } from '../../types/ConfirmJobButtonsProps'

export const ConfirmJobButtons = ({
  model,
  cancelRef,
  close,
  action,
}: ConfirmJobButtonsProps) => (
  <div className="flex gap-3">
    <button
      ref={cancelRef}
      type="button"
      onKeyDown={model.onKeyDown}
      onClick={close}
      className="border-line rounded border px-3 py-2"
    >
      Keep job
    </button>
    <button
      type="button"
      disabled={model.busy}
      onKeyDown={model.onKeyDown}
      onClick={model.submit}
      className="bg-accent text-space rounded px-3 py-2"
    >
      Confirm {action}
    </button>
  </div>
)
