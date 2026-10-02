import type { CliIo } from '../types/CliIo'
import { doctorCommand } from './commands/doctorCommand'
import { pairCommand } from './commands/pairCommand'
import { serveCommand } from './commands/serveCommand'
import { sessionsCommand } from './commands/sessionsCommand'
import { tokenCommand } from './commands/tokenCommand'

export const runCli = async (
  argv: readonly string[],
  io: CliIo,
): Promise<number> => {
  const commands: Record<
    string,
    (args: readonly string[], io: CliIo) => Promise<number>
  > = {
    serve: serveCommand,
    token: tokenCommand,
    pair: pairCommand,
    sessions: sessionsCommand,
    doctor: doctorCommand,
  }
  const command = Object.hasOwn(commands, argv[0] ?? '')
    ? commands[argv[0] ?? '']
    : undefined
  if (command === undefined) {
    io.err(
      'usage: orbit serve | token create | pair | sessions list|revoke <prefix> | doctor',
    )
    return 2
  }
  return command(argv.slice(1), io)
}
