import type { RunResult } from './RunResult'

export type EngineRunner = (
  args: readonly string[],
  signal: AbortSignal,
  timeoutMs?: number,
) => Promise<RunResult>
