import { InvalidPrefixError } from '../../auth/InvalidPrefixError'
import { listSessions } from '../../auth/listSessions'
import { revokeSessions } from '../../auth/revokeSessions'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const sessionsCommand = async (
  args: readonly string[],
  io: CliIo,
): Promise<number> => {
  const state = await openState(io.env)
  try {
    if (args[0] === 'list') {
      io.out('prefix    created                   last seen')
      for (const s of listSessions(state.authDb)) {
        io.out(
          `${s.prefix}  ${new Date(s.created).toISOString()}  ${new Date(s.lastSeen).toISOString()}`,
        )
      }
      return 0
    }
    if (args[0] === 'revoke' && args[1] !== undefined) {
      try {
        io.out(`revoked ${String(revokeSessions(state.authDb, args[1]))}`)
        return 0
      } catch (error) {
        io.err(
          error instanceof InvalidPrefixError
            ? 'refused: the prefix must be at least 8 hex characters'
            : 'orbit: failed',
        )
        return 1
      }
    }
    io.err('usage: orbit sessions list | orbit sessions revoke <prefix>')
    return 2
  } finally {
    state.close()
  }
}
