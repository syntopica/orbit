import type { EngineRunner } from './EngineRunner'

export type StartServerOptions = {
  readonly webRoot: string
  readonly signal: AbortSignal
  readonly engines: Readonly<Record<string, EngineRunner>>
}
