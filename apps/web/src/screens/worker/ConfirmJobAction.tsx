import { ConfirmDialogFrame } from '../../components/ConfirmDialogFrame'
import { StepUpTokenForm } from '../../components/StepUpTokenForm'
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
    <ConfirmDialogFrame
      headingId="job-confirm-heading"
      title={`Confirm ${action}`}
      close={close}
    >
      <p>
        {action} job <code className="break-all">{id}</code>?
      </p>
      {model.error ? (
        <p role="alert">Action failed. Check the job state and try again.</p>
      ) : null}
      {model.stepUp.prompt ? (
        <StepUpTokenForm
          model={model.stepUp}
          inputLabel="Admin token for this action"
          submitLabel={`Confirm ${action}`}
          onAccepted={model.submit}
        />
      ) : (
        <ConfirmJobButtons
          model={model}
          cancelRef={cancelRef}
          close={close}
          action={action}
        />
      )}
    </ConfirmDialogFrame>
  )
}
