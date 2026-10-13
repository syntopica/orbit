import { ConfirmDialogFrame } from '../../components/ConfirmDialogFrame'
import { StepUpTokenForm } from '../../components/StepUpTokenForm'
import { actionDescription } from '../../formatters/actionDescription'
import type { ActionConfirmDialogProps } from '../../types/ActionConfirmDialogProps'
import { ActionConfirmButtons } from './ActionConfirmButtons'

export const ActionConfirmDialog = ({
  target,
  action,
  close,
  confirm,
  error,
  sending,
  stepUp,
}: ActionConfirmDialogProps) => {
  return (
    <ConfirmDialogFrame
      headingId="action-confirm-heading"
      title={`Confirm ${action}`}
      close={close}
    >
      <p>
        {actionDescription(action)}: <code className="break-all">{target}</code>
        ?
      </p>
      {error ? (
        <p role="alert">Action failed. Check its state and try again.</p>
      ) : null}
      {stepUp.prompt ? (
        <StepUpTokenForm
          model={stepUp}
          inputLabel="Admin token for this action"
          submitLabel={`Confirm ${action}`}
          onAccepted={() => void confirm()}
        />
      ) : (
        <ActionConfirmButtons
          action={action}
          close={close}
          confirm={confirm}
          sending={sending}
        />
      )}
    </ConfirmDialogFrame>
  )
}
