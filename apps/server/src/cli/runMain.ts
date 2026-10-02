import { DataDirError } from '../config/DataDirError'
import { ProcessError } from '../process/ProcessError'
import type { CliIo } from '../types/CliIo'
import { runCli } from './runCli'

// The process entry's body: any failure becomes one fixed line, never the
// error's message or stack.
export const runMain = async (
  argv: readonly string[],
  io: CliIo,
): Promise<number> => {
  try {
    return await runCli(argv, io)
  } catch (error) {
    if (error instanceof DataDirError) {
      io.err('orbit: set SYNTOPICA_DATA to the absolute path of the instance')
    } else if (error instanceof ProcessError) {
      io.err(`orbit: failed (${error.reason})`)
    } else {
      io.err('orbit: failed')
    }
    return 1
  }
}
