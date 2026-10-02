import { createAdminToken } from '../../auth/createAdminToken'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const tokenCommand = async (
  args: readonly string[],
  io: CliIo,
): Promise<number> => {
  if (args[0] !== 'create') {
    io.err('usage: orbit token create')
    return 2
  }
  const state = await openState(io.env)
  const token = createAdminToken(state.authDb, Date.now())
  state.close()
  io.out('New admin token (shown once; any previous token stops working):')
  io.out(token)
  return 0
}
