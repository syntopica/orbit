import { listenLoopback } from './listenLoopback'

describe('listenLoopback', () => {
  it('binds 127.0.0.1 only and hands the real port to the handler', async () => {
    let seen = 0
    const { server, port } = await listenLoopback(0, (actual) => {
      seen = actual
      return () => new Response('ok')
    })
    expect(server.address()).toMatchObject({ address: '127.0.0.1', port })
    expect(seen).toBe(port)
    const res = await fetch(`http://127.0.0.1:${String(port)}/`)
    expect(await res.text()).toBe('ok')
    server.close()
    server.closeAllConnections()
  })
})
