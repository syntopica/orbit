import { useLogin } from '../../hooks/useLogin'

export const LoginScreen = () => {
  const model = useLogin()
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form
        onSubmit={model.submit}
        className="border-line bg-panel w-full max-w-sm space-y-4 rounded-2xl border p-6"
      >
        <h1 className="text-xl font-semibold tracking-tight">orbit</h1>
        <label className="text-muted block space-y-1 text-sm">
          <span>Admin token</span>
          <input
            type="password"
            autoComplete="current-password"
            value={model.token}
            onChange={(event) => {
              model.setToken(event.target.value)
            }}
            className="border-line bg-space text-ink w-full rounded-lg border px-3 py-2 font-mono"
          />
        </label>
        {model.status === 'rejected' && (
          <p role="alert" className="text-down text-sm">
            Token rejected
          </p>
        )}
        {model.status === 'error' && (
          <p role="alert" className="text-down text-sm">
            Server unreachable
          </p>
        )}
        <button
          type="submit"
          disabled={model.status === 'busy' || model.token === ''}
          className="bg-accent text-space w-full rounded-lg px-3 py-2 font-semibold disabled:opacity-50"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
