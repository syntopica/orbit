import { buildChildEnv } from '../process/buildChildEnv'
import { ProcessError } from '../process/ProcessError'
import type { EngineRunner } from '../types/EngineRunner'
import type { ResolvedEngine } from '../types/ResolvedEngine'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { sameArgs } from './sameArgs'

// Only the argument lists the table names ever run; anything else is refused.
export const createEngineRunner =
  (
    engine: ResolvedEngine,
    run: (request: RunRequest) => Promise<RunResult>,
  ): EngineRunner =>
  async (args, signal) => {
    if (!engine.subcommands.some((listed) => sameArgs(listed, args)))
      throw new ProcessError('check_failed')
    return await run({
      file: engine.file,
      args,
      env: buildChildEnv(process.env, engine.env),
      timeoutMs: 10_000,
      maxBytes: 8 * 1024 * 1024,
      signal,
    })
  }
