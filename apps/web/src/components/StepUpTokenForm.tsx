import type { StepUpPrompt } from '../types/StepUpPrompt'

export const StepUpTokenForm = ({
  model,
  inputLabel,
  submitLabel,
  onAccepted,
}: {
  model: StepUpPrompt
  inputLabel: string
  submitLabel: string
  onAccepted?: () => void
}) => (
  <form
    onSubmit={(event) => {
      model.submit(event, onAccepted)
    }}
    className="space-y-2"
  >
    <label className="block text-sm">
      Admin token
      <input
        aria-label={inputLabel}
        type="password"
        autoComplete="off"
        value={model.token}
        onChange={(event) => {
          model.setToken(event.target.value)
        }}
        className="border-line bg-space text-ink mt-1 w-full rounded border p-2"
      />
    </label>
    {model.stepError ? <p role="alert">Token rejected.</p> : null}
    <button
      type="submit"
      disabled={!model.token}
      className="bg-accent text-space rounded px-3 py-2"
    >
      {submitLabel}
    </button>
    <button
      type="button"
      onClick={model.cancelPrompt}
      className="ml-3 underline"
    >
      Cancel
    </button>
  </form>
)
