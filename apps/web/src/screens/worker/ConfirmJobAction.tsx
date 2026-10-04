import { useConfirmJobAction } from '../../hooks/useConfirmJobAction'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { ConfirmJobButtons } from './ConfirmJobButtons'

export const ConfirmJobAction = ({
  id,
  action,
  close,
  confirm,
}: {
  id: string
  action: 'cancel' | 'retry' | 'ack'
  close: () => void
  confirm: () => Promise<void>
}) => {
  const model = useConfirmJobAction(close, confirm)
  const cancelRef = useDialogFocus()
  return (
    <div>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close confirmation"
        onClick={close}
        className="bg-space/70 fixed inset-0 z-40"
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="job-confirm-heading"
        className="border-line bg-panel text-ink fixed inset-x-4 top-1/3 z-50 mx-auto max-w-md space-y-4 rounded-xl border p-5"
      >
        <h2 id="job-confirm-heading" className="text-lg font-semibold">
          Confirm {action}
        </h2>
        <p>
          {action} job <code>{id}</code>?
        </p>
        {model.error ? (
          <p role="alert">Action failed. Check the job state and try again.</p>
        ) : null}
        <ConfirmJobButtons
          model={model}
          cancelRef={cancelRef}
          close={close}
          action={action}
        />
      </dialog>
    </div>
  )
}
