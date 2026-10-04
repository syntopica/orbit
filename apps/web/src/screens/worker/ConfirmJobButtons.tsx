import type { RefObject } from 'react'

import type { useConfirmJobAction } from '../../hooks/useConfirmJobAction'

export const ConfirmJobButtons = ({
  model,
  cancelRef,
  close,
  action,
}: {
  model: ReturnType<typeof useConfirmJobAction>
  cancelRef: RefObject<HTMLButtonElement | null>
  close: () => void
  action: string
}) => (
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
