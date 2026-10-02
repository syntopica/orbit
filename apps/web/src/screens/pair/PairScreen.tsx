import { usePair } from '../../hooks/usePair'

export const PairScreen = () => {
  const status = usePair()
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      {status === 'busy' && <p aria-live="polite">Pairing this device…</p>}
      {status === 'invalid' && (
        <p role="alert">
          This pairing link is not valid. Run orbit pair again.
        </p>
      )}
      {status === 'rejected' && (
        <p role="alert">
          This pairing link has expired or already used. Run orbit pair again.
        </p>
      )}
      {status === 'error' && <p role="alert">Server unreachable.</p>}
    </main>
  )
}
