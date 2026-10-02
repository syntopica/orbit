import qrcode from 'qrcode-terminal'

import { createInvitation } from '../../auth/createInvitation'
import type { CliIo } from '../../types/CliIo'
import { openState } from '../openState'

export const pairCommand = async (
  _args: readonly string[],
  io: CliIo,
): Promise<number> => {
  const state = await openState(io.env)
  const host = state.config.allowedHosts[0]
  if (host === undefined) {
    state.close()
    io.err('orbit pair needs a tailnet name in orbit.json allowedHosts')
    return 1
  }
  const invitation = createInvitation(state.authDb, Date.now())
  state.close()
  const url = `https://${host}/pair#${invitation.id}.${invitation.secret}`
  qrcode.generate(url, { small: true }, (code) => {
    io.out(code)
  })
  io.out(url)
  io.out('Valid for 5 minutes, once.')
  return 0
}
