import { buildChildEnv } from '../process/buildChildEnv'
import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'
import type { ResolvedEngine } from '../types/ResolvedEngine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { resolveListedArgs } from './resolveListedArgs'

// Only the argument lists the table names ever run; anything else is refused.
// A request may name an entry by its leading arguments (resolveListedArgs).
export const createEngineRunner =
  (
    engine: ResolvedEngine,
    run: (request: RunRequest) => Promise<RunResult>,
  ): EngineRunner =>
  async (args, signal) => {
    const listed = resolveListedArgs(engine.subcommands, args)
    if (listed === null) throw new ProcessError('check_failed')
    return await run({
      file: engine.file,
      args: [...listed],
      env: buildChildEnv(process.env, engine.env),
      timeoutMs: 10_000,
      maxBytes: 8 * 1024 * 1024,
      signal,
    })
  }
