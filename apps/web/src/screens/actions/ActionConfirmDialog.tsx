import { actionDescription } from '../../formatters/actionDescription'
import { ActionConfirmButtons } from './ActionConfirmButtons'

export const ActionConfirmDialog = ({
  target,
  action,
  close,
  confirm,
  error,
  sending,
}: {
  target: string
  action: string
  close: () => void
  confirm: () => Promise<void>
  error: boolean
  sending: boolean
}) => {
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
        aria-labelledby="action-confirm-heading"
        className="border-line bg-panel text-ink fixed inset-x-4 top-1/3 z-50 mx-auto max-w-md space-y-4 rounded-xl border p-5"
      >
        <h2 id="action-confirm-heading" className="text-lg font-semibold">
          Confirm {action}
        </h2>
        <p>
          {actionDescription(action)}:{' '}
          <code className="break-all">{target}</code>?
        </p>
        {error ? (
          <p role="alert">Action failed. Check its state and try again.</p>
        ) : null}
        <ActionConfirmButtons
          action={action}
          close={close}
          confirm={confirm}
          sending={sending}
        />
      </dialog>
    </div>
  )
}
