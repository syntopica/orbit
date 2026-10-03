import type { EngineRunner } from './EngineRunner'

export type ResolvedEngines = {
  readonly runners: Readonly<Record<string, EngineRunner>>
  readonly failed: readonly string[]
}
