import { createServer } from 'node:net'

import { openTestState } from '../../test/openTestState'
import { checkPort } from './checkPort'

const occupy = async (): Promise<{ port: number; close: () => void }> =>
  new Promise((resolve) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({
        port:
          typeof address === 'object' && address !== null ? address.port : 0,
        close: () => {
          server.close()
        },
      })
    })
  })

describe('checkPort', () => {
  it('warns when the configured port is taken', async () => {
    const taken = await occupy()
    const state = await openTestState()
    const busy = { ...state, config: { ...state.config, port: taken.port } }
    expect(await checkPort(busy)).toMatchObject({ level: 'warn' })
    taken.close()
    state.close()
  })

  it('passes when the configured port is free', async () => {
    const spare = await occupy()
    spare.close()
    const state = await openTestState()
    const free = { ...state, config: { ...state.config, port: spare.port } }
    expect(await checkPort(free)).toMatchObject({
      level: 'ok',
      detail: `${String(spare.port)} free`,
    })
    state.close()
  })
})
