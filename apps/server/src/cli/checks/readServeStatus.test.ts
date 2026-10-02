import { readServeStatus } from './readServeStatus'

const HOST = 'orbit.example.ts.net'
const PROXY = 'http://127.0.0.1:8790'
const HOST_PORT = `${HOST}:443`
const status = (
  handlers: Record<string, { Proxy: string }>,
  funnel: Record<string, boolean> = {},
): string =>
  JSON.stringify({
    Web: { [HOST_PORT]: { Handlers: handlers } },
    AllowFunnel: funnel,
  })

describe('readServeStatus', () => {
  it('reads a name whose root handler proxies to the port', () => {
    const json = status({ '/': { Proxy: PROXY } })
    expect(readServeStatus(json, 8790)).toEqual({
      served: [HOST],
      funnelled: [],
    })
  })

  it('accepts a trailing slash on the proxy target', () => {
    const json = status({ '/': { Proxy: `${PROXY}/` } })
    expect(readServeStatus(json, 8790).served).toHaveLength(1)
  })

  it('marks a served name that Funnel exposes', () => {
    const json = status({ '/': { Proxy: PROXY } }, { [HOST_PORT]: true })
    expect(readServeStatus(json, 8790).funnelled).toEqual([HOST])
  })

  it('ignores Funnel set to false', () => {
    const json = status({ '/': { Proxy: PROXY } }, { [HOST_PORT]: false })
    expect(readServeStatus(json, 8790).funnelled).toEqual([])
  })

  it('does not count a name that proxies only another path', () => {
    const json = status({ '/other': { Proxy: PROXY } })
    expect(readServeStatus(json, 8790)).toEqual({ served: [], funnelled: [] })
  })

  it('does not count a different port or a lookalike target', () => {
    const proxies = [
      'http://127.0.0.1:8791',
      'http://127.0.0.1:87900',
      'http://evil127.0.0.1:8790',
      'http://127.0.0.1:8790.evil',
    ]
    const served = proxies.flatMap(
      (proxy) =>
        readServeStatus(status({ '/': { Proxy: proxy } }), 8790).served,
    )
    expect(served).toEqual([])
  })

  it('reads anything unparseable as nothing served', () => {
    expect(readServeStatus('not json', 8790).served).toEqual([])
    expect(readServeStatus('{"Web":5}', 8790).served).toEqual([])
  })

  it('marks Funnel on a host that proxies orbit from any path', () => {
    const json = status(
      { '/': { Proxy: 'http://127.0.0.1:9999' }, '/app': { Proxy: PROXY } },
      { [HOST_PORT]: true },
    )
    expect(readServeStatus(json, 8790)).toEqual({
      served: [],
      funnelled: [HOST],
    })
  })

  it('does not mark Funnel on a host that never proxies orbit', () => {
    const json = status(
      { '/': { Proxy: 'http://127.0.0.1:9999' } },
      { [HOST_PORT]: true },
    )
    expect(readServeStatus(json, 8790).funnelled).toEqual([])
  })

  it('accepts localhost and 127.0.0.1 as orbit proxies', () => {
    const json = status({ '/': { Proxy: 'http://localhost:8790' } })
    expect(readServeStatus(json, 8790).served).toEqual([HOST])
  })

  it('skips a malformed entry alone and still evaluates the others', () => {
    const json = JSON.stringify({
      Web: {
        'bad.example.ts.net:443': { Handlers: 5 },
        'worse.example.ts.net:443': 'nope',
        [HOST_PORT]: { Handlers: { '/': { Proxy: PROXY } } },
      },
      AllowFunnel: { [HOST_PORT]: true, 'bad.example.ts.net:443': 'yes' },
    })
    expect(readServeStatus(json, 8790)).toEqual({
      served: [HOST],
      funnelled: [HOST],
    })
  })
})
