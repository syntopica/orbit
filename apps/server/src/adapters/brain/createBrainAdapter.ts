import { doctorDocumentSchema } from '../../engines/doctorDocumentSchema'
import { parseEngineDocument } from '../../engines/parseEngineDocument'
import type { Adapter } from '../../types/Adapter'
import type { EngineRunner } from '../../types/EngineRunner'
import { brainLintSchema } from './brainLintSchema'
import { summarizeBrain } from './summarizeBrain'

export const createBrainAdapter = (deps: {
  readonly run: EngineRunner
  readonly cadenceMs: number
}): Adapter => ({
  id: 'brain',
  cadenceMs: deps.cadenceMs,
  timeoutMs: 25_000,
  freshnessMs: deps.cadenceMs * 2,
  read: async (signal) => {
    const lint = parseEngineDocument(
      await deps.run(['lint', '--json'], signal),
      brainLintSchema,
    )
    const doctor = parseEngineDocument(
      await deps.run(['doctor', '--json'], signal),
      doctorDocumentSchema,
    )
    const now = new Date()
    return {
      component: 'brain',
      ...summarizeBrain(lint, doctor, now),
      events: [],
      observedAt: now.toISOString(),
    }
  },
})
