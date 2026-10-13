import { useDialogFocus } from '../../hooks/useDialogFocus'
import type { ActionConfirmButtonsProps } from '../../types/ActionConfirmButtonsProps'

export const ActionConfirmButtons = ({
  action,
  close,
  confirm,
  sending,
}: ActionConfirmButtonsProps) => {
  const cancelRef = useDialogFocus()
  return (
    <div className="flex justify-end gap-2">
      <button ref={cancelRef} type="button" onClick={close} disabled={sending}>
        Cancel
      </button>
      <button type="button" onClick={() => void confirm()} disabled={sending}>
        Confirm {action}
      </button>
    </div>
  )
}
