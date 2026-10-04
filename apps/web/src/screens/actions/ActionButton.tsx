import { useActionRun } from '../../hooks/useActionRun'
import { ActionConfirmDialog } from './ActionConfirmDialog'
import { ActionRunLink } from './ActionRunLink'

export const ActionButton = ({
  target,
  action,
  label,
  path,
}: {
  target: string
  action: string
  label: string
  path: string
}) => {
  const model = useActionRun(path)
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={model.select}
        disabled={model.current?.state === 'started' || model.sending}
        className="border-line rounded border px-3 py-1 text-sm"
      >
        {model.current?.state === 'started' ? (
          <span role="status" className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="border-muted size-3 animate-spin rounded-full border-2 border-t-transparent"
            />
            Running…
          </span>
        ) : (
          label
        )}
      </button>
      <ActionRunLink id={model.id} state={model.current?.state} />
      {model.selected ? (
        <ActionConfirmDialog
          target={target}
          action={action}
          close={model.close}
          confirm={model.confirm}
          error={model.error}
          sending={model.sending}
          stepUp={model.stepUp}
        />
      ) : null}
    </span>
  )
}
