import { probeOrbit } from './probeOrbit'

describe('probeOrbit', () => {
  it('counts any answer below 500 as alive', async () => {
    const urls: string[] = []
    const fetcher = (async (url: string) => {
      urls.push(url)
      return Promise.resolve(new Response(null, { status: 401 }))
    }) as typeof fetch
    expect(await probeOrbit(8790, fetcher)).toBe(true)
    expect(urls).toEqual(['http://127.0.0.1:8790/'])
  })
  it('counts a 5xx, a refused connection and a timeout as no answer', async () => {
    const failing = (async () =>
      Promise.resolve(new Response(null, { status: 503 }))) as typeof fetch
    const refused = (async () =>
      Promise.reject(new TypeError('fetch failed'))) as typeof fetch
    const hung = (async (_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new Error('aborted'))
        })
      })) as typeof fetch
    expect(await probeOrbit(1, failing)).toBe(false)
    expect(await probeOrbit(1, refused)).toBe(false)
    expect(await probeOrbit(1, hung, 10)).toBe(false)
  })
})
