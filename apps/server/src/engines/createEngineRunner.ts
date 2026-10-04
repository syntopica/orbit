import { buildChildEnv } from '../process/buildChildEnv'
import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'
import type { ResolvedEngine } from '../types/ResolvedEngine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { resolveListedArgs } from './resolveListedArgs'

// Only argument lists the table names ever run (spec 5.3); a placeholder is
// filled only with a valid page id, and a leading request runs its entry whole.
export const createEngineRunner =
  (
    engine: ResolvedEngine,
    run: (request: RunRequest) => Promise<RunResult>,
  ): EngineRunner =>
  async (requested, signal, timeoutMs = engine.timeoutMs ?? 10_000) => {
    const args = resolveListedArgs(engine.subcommands, requested)
    if (args === null) throw new ProcessError('check_failed')
    return await run({
      file: engine.file,
      args,
      env: buildChildEnv(process.env, engine.env),
      timeoutMs,
      maxBytes: 8 * 1024 * 1024,
      signal,
    })
  }
