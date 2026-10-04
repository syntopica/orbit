import { usePendingBoard } from '../../hooks/usePendingBoard'
import { PendingFilters } from './PendingFilters'
import { PendingSources } from './PendingSources'

export const PendingScreen = () => {
  const model = usePendingBoard()
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted text-sm">Triage board</p>
            <h1 className="text-2xl font-semibold">Pending</h1>
          </div>
          <button
            type="button"
            className="border-line rounded-lg border px-3 py-2 text-sm"
            onClick={() => {
              void model.query.refetch()
            }}
          >
            Refresh
          </button>
        </div>
        {model.query.data !== undefined ? (
          <PendingFilters model={model} />
        ) : null}
      </header>
      {model.query.isPending ? <p>Loading pending items…</p> : null}
      {model.query.isError ? (
        <p role="alert">Could not read pending items.</p>
      ) : null}
      {model.query.data !== undefined ? <PendingSources model={model} /> : null}
    </main>
  )
}
