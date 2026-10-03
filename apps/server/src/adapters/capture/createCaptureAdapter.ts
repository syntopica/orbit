import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import type { WorkerAdapterDeps } from '../../types/WorkerAdapterDeps'
import { fetchWorkerText } from '../worker/fetchWorkerText'
import { captureCountSchema } from './captureCountSchema'
import { normalizeOldestAt } from './normalizeOldestAt'

// The capture service wraps answers in { data }; its schemaVersion is checked
// by the schema literal, so a new major reads as schema_invalid.
export const createCaptureAdapter = (deps: WorkerAdapterDeps): Adapter => ({
  id: 'capture',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 10_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const text = await fetchWorkerText(deps, '/api/captures/count', signal)
    const { data } = parseEngineDocument(
      { code: 0, stdout: text },
      captureCountSchema,
    )
    const at = new Date().toISOString()
    return {
      component: 'capture',
      health: { state: 'ok', reason: null },
      metrics: [{ key: 'capture.undrained', value: data.count, at }],
      pending:
        data.count > 0
          ? [
              {
                key: 'capture.undrained',
                count: data.count,
                oldestAt: normalizeOldestAt(data.oldestAt),
              },
            ]
          : [],
      events: [],
      observedAt: at,
    }
  },
})
