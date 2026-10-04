import type { useJobContentPanel } from '../../hooks/useJobContentPanel'

export const SecretTokenForm = ({
  model,
}: {
  model: ReturnType<typeof useJobContentPanel>
}) => (
  <form onSubmit={model.submit} className="space-y-2">
    <label className="block text-sm">
      Admin token
      <input
        aria-label="Admin token for reveal"
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
      Reveal content
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
