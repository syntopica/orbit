import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveEngines } from '../../engines/resolveEngines'
import { runProcess } from '../../process/runProcess'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'
import { startServer } from '../startServer'
import { printPlistCommand } from './printPlistCommand'

export const serveCommand = async (
  args: readonly string[],
  io: CliIo,
): Promise<number> => {
  if (args[0] === '--print-plist') return printPlistCommand(io)
  const state = await openState(io.env)
  const { runners, failed } = await resolveEngines(
    state.config.engines,
    state.instance.engines,
    runProcess,
  ).catch((error: unknown) => {
    state.close()
    throw error
  })
  for (const name of failed) io.err(`engine ${name} not runnable; reads down`)
  const controller = new AbortController()
  const webRoot = join(dirname(fileURLToPath(import.meta.url)), 'public')
  try {
    const { port } = await startServer(state, {
      webRoot,
      signal: controller.signal,
      engines: runners,
    })
    io.out(`orbit listening on http://127.0.0.1:${String(port)}`)
  } catch (error) {
    state.close()
    io.err(error instanceof Error ? error.message : 'orbit could not start')
    return 1
  }
  await new Promise<void>((resolve) => {
    const stop = (): void => {
      controller.abort()
      resolve()
    }
    process.once('SIGTERM', stop)
    process.once('SIGINT', stop)
  })
  return 0
}
