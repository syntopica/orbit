import { SyncLayoutWorker } from './SyncLayoutWorker'

// The `vi.mock` body for `layout/createLayoutWorker`.
export const fakeLayoutWorkerModule = {
  createLayoutWorker: (): Worker => new SyncLayoutWorker() as unknown as Worker,
}
