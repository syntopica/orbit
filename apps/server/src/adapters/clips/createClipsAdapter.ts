import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { clipsStatusSchema } from './clipsStatusSchema'
import { summarizeClips } from './summarizeClips'

export const createClipsAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'clips',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const status = parseEngineDocument(
      await deps.run(['status', '--json'], signal),
      clipsStatusSchema,
    )
    const doctor = parseEngineDocument(
      await deps.run(['doctor', '--json'], signal),
      doctorDocumentSchema,
    )
    const now = new Date()
    return {
      component: 'clips',
      ...summarizeClips(status, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})
