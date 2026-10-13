import type { EngineRunner } from './EngineRunner'

export type BrainAdapterDeps = {
  readonly run: EngineRunner
  readonly cadenceMs: number
}
