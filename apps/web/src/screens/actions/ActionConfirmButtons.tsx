import { useDialogFocus } from '../../hooks/useDialogFocus'

export const ActionConfirmButtons = ({
  action,
  close,
  confirm,
  sending,
}: {
  action: string
  close: () => void
  confirm: () => Promise<void>
  sending: boolean
}) => {
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
