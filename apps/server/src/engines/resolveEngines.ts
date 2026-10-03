import { ProcessError } from '../process/ProcessError'
import type { EngineTable } from '../types/EngineTable'
import type { InstanceConfig } from '../types/InstanceConfig'
import type { ResolvedEngines } from '../types/ResolvedEngines'
import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { createEngineRunner } from './createEngineRunner'
import { resolveEngineCommand } from './resolveEngineCommand'

// An engine the instance does not name, or whose command is not executable,
// is reported in `failed` so its adapter can still be built and read `down`.
export const resolveEngines = async (
  table: EngineTable,
  instance: InstanceConfig['engines'],
  run: (request: RunRequest) => Promise<RunResult>,
): Promise<ResolvedEngines> => {
  const runners: ResolvedEngines['runners'] = {}
  const failed: string[] = []
  for (const [name, spec] of Object.entries(table)) {
    const checkout = instance[name]?.path
    try {
      if (checkout === undefined) throw new ProcessError('not_found')
      const file = await resolveEngineCommand(checkout, spec.command)
      const { subcommands, env } = spec
      Object.assign(runners, {
        [name]: createEngineRunner({ file, subcommands, env }, run),
      })
    } catch (error) {
      if (!(error instanceof ProcessError)) throw error
      failed.push(name)
    }
  }
  return { runners, failed }
}
