import type { useWorkerJobsScreen } from '../../hooks/useWorkerJobsScreen'

export const WorkerJobsFilters = ({
  model,
}: {
  model: ReturnType<typeof useWorkerJobsScreen>
}) => (
  <form
    onSubmit={model.apply}
    className="border-line bg-panel grid gap-3 rounded-xl border p-4 sm:grid-cols-4"
  >
    <label className="text-sm">
      Queue
      <input
        aria-label="Queue"
        name="queue"
        key={model.filters.queue ?? ''}
        defaultValue={model.filters.queue ?? ''}
        className="border-line bg-space text-ink mt-1 w-full rounded border p-2 text-base md:text-sm"
      />
    </label>
    <label className="text-sm">
      State
      <input
        aria-label="State"
        name="state"
        key={model.filters.state ?? ''}
        defaultValue={model.filters.state ?? ''}
        className="border-line bg-space text-ink mt-1 w-full rounded border p-2 text-base md:text-sm"
      />
    </label>
    <label className="text-sm">
      Producer
      <input
        aria-label="Producer"
        name="producer"
        key={model.filters.producer ?? ''}
        defaultValue={model.filters.producer ?? ''}
        className="border-line bg-space text-ink mt-1 w-full rounded border p-2 text-base md:text-sm"
      />
    </label>
    <button type="submit" className="bg-accent text-space self-end rounded p-2">
      Apply filters
    </button>
  </form>
)
